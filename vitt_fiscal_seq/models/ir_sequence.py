# -*- coding: utf-8 -*-
##############################################################################


from odoo import models, fields, api


class Sequence(models.Model):
    _inherit = "ir.sequence"

    fiscal_sequence_regime_ids = fields.One2many("vitt_fiscal_seq.fiscal_sequence_regime", "sequence_id")
    expiration_date = fields.Date('Expiration Date')
    vitt_min_value = fields.Char('Minimal number', readonly=True, compute = 'display_minimal_value')
    vitt_max_value = fields.Char('Max number', readonly=True, compute = 'display_max_value')
    percentage_alert = fields.Float('percentage alert', default=80)
    percentage = fields.Float('percentage', compute='compute_percentage')
    vitt_prefix = fields.Char(string = 'V Prefix', related='prefix' , default = 8)
    vitt_padding = fields.Integer(string = ' V Number padding', related='padding')
    vitt_number_next_actual = fields.Integer(string = ' V Next Number', related='number_next_actual')
    is_fiscal_sequence = fields.Boolean("Fiscal sequence")
    user_ids = fields.Many2many("res.users", string="Users")

    @api.depends('min_value')
    def display_minimal_value(self):
        if self.vitt_prefix:
            start_number_filled = str(self.min_value)
            for filled in range(len(str(self.min_value)), self.vitt_padding):
                start_number_filled = '0' + start_number_filled
            self.vitt_min_value = self.vitt_prefix + str(start_number_filled)

    @api.depends('max_value')
    def display_max_value(self):
        if self.vitt_prefix:
            final_number = self.max_value
            final_number_filled = str(self.max_value)
            for filled in range(len(str(final_number)), self.vitt_padding):
                final_number_filled = '0' + final_number_filled
            self.vitt_max_value = self.vitt_prefix + str(final_number_filled)

    @api.depends('number_next_actual')
    def compute_percentage(self):
        numerator = self.number_next_actual - self.min_value
        denominator = self.max_value - self.min_value
        if denominator > 0:
            difference = (self.number_next_actual - self.min_value) / (self.max_value - self.min_value)
            self.percentage = (difference * 100) - 1
        else:
            self.percentage = 0
