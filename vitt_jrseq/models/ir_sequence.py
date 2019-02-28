# -*- coding: utf-8 -*-

from odoo import models, fields, api


class Sequence(models.Model):
    _inherit = "ir.sequence"

    journal_id = fields.Many2one("account.journal", "Journal")
    min_value = fields.Integer('Minimal value')
    max_value = fields.Integer('Max value')
