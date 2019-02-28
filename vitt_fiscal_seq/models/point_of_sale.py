# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    #sar_number = fields.Char(string='Número de Factura', readonly=True, default=False, help="Unique number of the invoice, computed automatically when the invoice is created.", copy=False)
    
    @api.multi
    def create(self,values):
        new_name = self.env['ir.sequence'].next_by_code('pos_order')
        values['pos_reference'] = new_name
        # values['name'] = new_name
        # for pos in self:
        #     pos.write({'name': new_name})
        res = super(PosOrder, self).create(values)
        return res

    # @api.multi
    # def assign_perms(self):
    #     users_id = [1]
    #     aux_users = [(4, i) for i in users_id.id]
    #     group_code = self.env['res.groups'].search([('id', '=', self.env.ref('vitt_fiscal_seq.authorization_code').id)])
    #     group_regime = self.env['res.groups'].search([('id', '=', self.env.ref('vitt_fiscal_seq.fiscal_sequence_regime').id)])
    #     group_code.write({'users': aux_users})
    #     group_regime.write({'users': aux_users})


