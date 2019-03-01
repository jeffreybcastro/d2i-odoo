# -*- coding: utf-8 -*-
##############################################################################
#
#    Cybrosys Technologies Pvt. Ltd.
#    Copyright (C) 2017-TODAY Cybrosys Technologies(<http://www.cybrosys.com>).
#    Author: Cybrosys Techno Solutions(<http://www.cybrosys.com>)
#    you can modify it under the terms of the GNU LESSER
#    GENERAL PUBLIC LICENSE (LGPL v3), Version 3.
#
#    It is forbidden to publish, distribute, sublicense, or sell copies
#    of the Software or modified copies of the Software.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU LESSER GENERAL PUBLIC LICENSE (LGPL v3) for more details.
#
#    You should have received a copy of the GNU LESSER GENERAL PUBLIC LICENSE
#    GENERAL PUBLIC LICENSE (LGPL v3) along with this program.
#    If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
{
    'name': 'Company Logo In POS Receipt',
    'summary': """Add Company Logo , Info & Customer name to POS Ticket""",
    'version': '10.0.1.1',
    'description': """Add Company Logo , Info & Customer name to POS Ticket""",
    'author': 'Darwin Calix',
    'company': 'D2i Solutions',
    'website': 'www.D2i-Solutions.com',
    'category': 'Point Of Sale',
    'depends': ['base','point_of_sale'],
    'license': 'AGPL-3',
    'data': [
    'static/src/xml/custom_pos_view.xml',
    'views/pos_view_update.xml'
    ],
    'qweb': ['static/src/xml/pos_ticket_view.xml'],
    'images': [],
    'demo': [],
    'installable': True,
    'application': True,
    'auto_install': False,
    'active' : True,

}