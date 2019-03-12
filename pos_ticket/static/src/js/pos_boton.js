odoo.define('pos_boton', function (require) {
"use strict";

var form_widget = require('web.form_widgets');
var core = require('web.core');
var _t = core._t;
var QWeb = core.qweb;

form_widget.WidgetButton.include({
    on_click: function() {
         if(this.node.attrs.custom === "click"){

            // YOUR CODE

            return;
         }
         this._super();
    },
});
});