# -*- coding: utf-8 -*-
##############################################################################
# For copyright and license notices, see __manifest__.py file in module root
# directory
##############################################################################

from odoo import models, fields


class AccountJournal(models.Model):
    _inherit = "account.journal"

    allow_multi_sequence = fields.Boolean('Allow Multi Fiscal Sequence', default=False, help='Create multi sequences for this journal')
    sequence_ids = fields.Many2many('ir.sequence', string='Sequences')
