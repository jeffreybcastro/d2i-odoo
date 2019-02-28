# -*- coding: utf-8 -*-
# Copyright 2016 Business Analytics Consulting Group S.A. de C.V.

from odoo import models, fields


class AccountJournal(models.Model):
    _inherit = "account.journal"

    sequence_ids = fields.Many2many('ir.sequence', string='Sequences')
