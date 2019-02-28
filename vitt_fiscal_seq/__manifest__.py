# -*- coding: utf-8 -*-
##############################################################################
##############################################################################

{
    'name': "Regulación del SAR",
    'summary': """
        Regulación del SAR para regimene de facturación para autoimpresores
        """,
    'description': """
         Regulación del SAR para regimene de facturación para autoimpresores
    """,
    'author': 'D2i Solutions',
    'version': '1.1',
    'license': 'Other proprietary',
    'maintainer': '',
    'contributors': '',
    'category': 'Extra Tools',
    'depends': ['base', 'account', 'vitt_jrseq',
    #'point_of_sale'
    ],
    'data': [
        "security/groups.xml",
        "security/ir.model.access.csv",
        "wizard/journal_settings_view.xml",
        "views/config_journal_view.xml",
        "views/config_authorization_code_view.xml",
        "views/ir_sequence_view.xml",
        "views/account_invoice_view.xml",
        "reports/account_report.xml",
        #"views/pos_view_update.xml",
        
    ],
    'demo': [
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
