# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import Warning


class SequenceJournal(models.TransientModel):
    _name = "vitt_fiscal_seq.journal_settings"
    _description = "Journal Settings"

    journal_id = fields.Many2one("account.journal", "Journal", required=True)
    vitt_prefix = fields.Char('Prefix')
    min_value = fields.Integer('Minimal value', required=True)
    max_value = fields.Integer('Max value', required=True)
    number_next = fields.Integer('Next Number to Use', required=True)
    vitt_padding = fields.Integer('Number padding', default=8 )
    company_id = fields.Many2one('res.company', "Company")
    sequence_name = fields.Char("Sequence name")
    user_ids = fields.Many2many("res.users", string="Users")
    new_sequence = fields.Boolean("Is a new sequence")
    sequence_id = fields.Many2one("ir.sequence", "Fiscal Sequence")
    doc_type = fields.Selection([
        ('out_invoice', 'Customer Invoices'),
        ('out_refund', 'Credit Notes'),
        ('in_refund', 'Debit Notes'),
        ('pos_order', 'Punto de Venta')
    ], string='Sequence Type', required=True)

    @api.onchange('min_value')
    def _onchange_min_value(self):
        if not self.number_next:
            self.number_next = self.min_value

    @api.one
    def fct_settings_fiscal(self):
        ctx = self._context
        obj_code_authorization = self.env["vitt_fiscal_seq.authorization_code"].browse(ctx['active_id'])

        if self.number_next < self.min_value:
            raise Warning(_("'Next Number to Use' must be greater than 'Minimal Value'."))
        if self.number_next > self.max_value:
            raise Warning(_("'Next Number to Use' must be less than 'Max Value'."))

        # if self.vitt_padding <= 0:
        #     raise Warning(_("Padding must be greater than zero."))
        if self.min_value >= self.max_value:
            raise Warning(_("Max Value must be greater than Minimal Value."))

        if self.new_sequence:
            if not self.sequence_name:
                raise Warning(_("Sequence name is empty."))
            else:
                self.fct_validated_exists()
                obj_fiscal_id = self.fct_fiscal_sequence_regime()
                if obj_fiscal_id:
                    obj_sequence_id = self.fct_sequence_create(obj_fiscal_id)
                    if obj_sequence_id:
                        obj_journal_id = self.fct_journal_sequence(obj_sequence_id)
                    else:
                        raise Warning(_("Sequence is not correct."))
        else:
            if self.sequence_id:
                for fiscal_line in self.sequence_id.fiscal_sequence_regime_ids:
                    if fiscal_line.authorization_code_id.id == obj_code_authorization.id:
                        raise Warning(_('This authorization code is already in use '))
                self.fct_validated_exists()
                obj_fiscal_id = self.fct_fiscal_sequence_regime()
                if obj_fiscal_id:
                    obj_sequence_id = self.fct_sequence_write(obj_fiscal_id, self.sequence_id.id)
                    if obj_sequence_id:
                        obj_journal_id = self.fct_journal_sequence(obj_sequence_id)
                    else:
                        raise Warning(_("Sequence is not correct."))
            else:
                raise Warning(_("You need select a sequence."))

    def fct_sequence_write(self, fiscal_sequence_id, sequence_id):
        obj_sequence = self.env["ir.sequence"].browse(sequence_id)
        ctx = self._context
        obj_code_authorization = self.env["vitt_fiscal_seq.authorization_code"].browse(ctx['active_id'])
        obj_fiscal_sequence_regime = self.env["vitt_fiscal_seq.fiscal_sequence_regime"].browse(fiscal_sequence_id)
        vitt_min_value = 0
        vitt_max_value = 0
        if self.vitt_prefix:
            start_number_filled = str(self.min_value)
            for filled in range(len(str(self.min_value)), self.vitt_padding):
                start_number_filled = '0' + start_number_filled
            vitt_min_value = self.vitt_prefix + str(start_number_filled)
            final_number = self.max_value
            final_number_filled = str(self.max_value)
            for filled in range(len(str(final_number)), self.vitt_padding):
                final_number_filled = '0' + final_number_filled
            vitt_max_value = self.vitt_prefix + str(final_number_filled)
        values = {'fiscal_sequence_regime_ids': [(4, obj_fiscal_sequence_regime.id, None)],
                  'min_value': self.min_value,
                  'max_value': self.max_value,
                  'expiration_date': obj_code_authorization.expiration_date,
                  'vitt_prefix': obj_code_authorization.code_type,#self.vitt_prefix,
                  'vitt_padding': self.vitt_padding,
                  'vitt_min_value': vitt_min_value,
                  'vitt_max_value': vitt_max_value,
                  'vitt_number_next_actual': self.number_next,
                  'code': self.doc_type, }
        sequence_write_id = obj_sequence.write(values)
        if sequence_write_id:
            for fiscal_regime in obj_sequence.fiscal_sequence_regime_ids:
                if fiscal_regime.id != obj_fiscal_sequence_regime.id:
                    fiscal_regime.actived = False
            if self.user_ids:
                users_vals = {}
                for users in self.user_ids:
                    users_vals = {
                        'user_ids': [(4, users.id, None)],
                    }
                if users_vals:
                    obj_sequence.write(users_vals)
                    obj_fiscal_sequence_regime.write(users_vals)

            sequence_write_id = obj_fiscal_sequence_regime.write({'sequence_id': sequence_id})
        obj_sequence.write({'number_next': self.number_next})
        return obj_sequence.id

    def fct_journal_sequence(self, obj_sequence_id):
        obj_sequence = self.env["ir.sequence"].browse(obj_sequence_id)
        for journal in self.journal_id:
            if not journal.allow_multi_sequence:
                journal.write({'allow_multi_sequence': True})
            journal.write({'sequence_ids': [(4, obj_sequence.id, None)]})
            obj_sequence.write({'journal_id': journal.id})
            return True

    def fct_validated_exists(self):
        sq_obj = self.env["ir.sequence"].search([('vitt_prefix', '=', self.vitt_prefix), ('vitt_padding', '=', self.vitt_padding), ('code', '=', self.doc_type),'|',('company_id', '=', self.company_id.id), ('journal_id', '=', self.journal_id.id)])
        for sq in sq_obj:
            if not self.number_next > sq.max_value or self.number_next < sq.min_value:
                raise Warning(_("The number exists already, please change the settings."))

    def fct_sequence_create(self, fiscal_sequence_id):
        obj_sequence = self.env["ir.sequence"]
        ctx = self._context
        obj_code_authorization = self.env["vitt_fiscal_seq.authorization_code"].browse(ctx['active_id'])
        obj_fiscal_sequence_regime = self.env["vitt_fiscal_seq.fiscal_sequence_regime"].browse(fiscal_sequence_id)
        vitt_min_value = 0
        vitt_max_value = 0
        if self.vitt_prefix:
            start_number_filled = str(self.min_value)
            for filled in range(len(str(self.min_value)), self.vitt_padding):
                start_number_filled = '0' + start_number_filled
            vitt_min_value = self.vitt_prefix + str(start_number_filled)
            final_number = self.max_value
            final_number_filled = str(self.max_value)
            for filled in range(len(str(final_number)), self.vitt_padding):
                final_number_filled = '0' + final_number_filled
            vitt_max_value = self.vitt_prefix + str(final_number_filled)
        sequence_validated = self.env["ir.sequence"].search([('vitt_prefix', '=', self.vitt_prefix), ('vitt_padding', '=', self.vitt_padding)])
        values = {'name': self.sequence_name,
                  'fiscal_sequence_regime_ids': [(4, obj_fiscal_sequence_regime.id, None)],
                  'min_value': self.min_value,
                  'max_value': self.max_value,
                  'expiration_date': obj_code_authorization.expiration_date,
                  'vitt_prefix': obj_code_authorization.code_type,#self.vitt_prefix,
                  'vitt_padding': self.vitt_padding,
                  'vitt_min_value': vitt_min_value,
                  'vitt_max_value': vitt_max_value,
                  'is_fiscal_sequence': True,
                  'percentage_alert': 80.0,
                  'vitt_number_next_actual': self.number_next,
                  'code': self.doc_type, }
        sequence_id = obj_sequence.create(values)
        if sequence_id:
            users_vals = {}
            for users in self.user_ids:
                users_vals = {
                    'user_ids': [(4, users.id, None)],
                }
            if users_vals:
                obj_sequence.write(users_vals)
                obj_fiscal_sequence_regime.write(users_vals)

            obj_fiscal_sequence_regime.write({'sequence_id': sequence_id.id})

        sequence_id.write({'number_next': self.number_next})
        return sequence_id.id

    def fct_fiscal_sequence_regime(self):
        obj_fiscal_sequence_regime = self.env["vitt_fiscal_seq.fiscal_sequence_regime"]
        ctx = self._context
        obj_code_authorization = self.env["vitt_fiscal_seq.authorization_code"].browse(ctx['active_id'])
        values = {'authorization_code_id': obj_code_authorization.id,
                  '_from': self.min_value,
                  '_to': self.max_value,
                  'journal_id': self.journal_id.id,
                  'actived': True}
        obj_fiscal_id = obj_fiscal_sequence_regime.create(values)
        return obj_fiscal_id.id
