# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    @api.multi
    def create(self,values):
        new_name = self.env['ir.sequence'].next_by_code('pos_order')
        values['pos_reference'] = new_name
        values['name'] = new_name
        # for pos in self:
        #     pos.write({'name': new_name})
        res = super(PosOrder, self).create(values)
        return res






