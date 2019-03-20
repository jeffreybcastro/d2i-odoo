from odoo import models, fields

class taxes_hn(models.Model):
    _inherit = "account.tax"    

    taxes_hn = fields.Integer(string="ID Impuesto HN")