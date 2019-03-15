odoo.define('pos_ticket.models_extend', function (require){
    "use strict";
    var models = require('point_of_sale.models');
    var _super_order = models.Order.prototype;
    var _super_order_line = models.Orderline.prototype;
    // var _super_order_receipt = models.ScreenWidget.prototype;
    var core = require('web.core');
    var gui = require('point_of_sale.gui');
    var _t = core._t;
    var QWeb = core.qweb;
    var utils = require('web.utils');
    var round_di = utils.round_decimals;
    var screens = require('point_of_sale.screens');
    var super_screens =  screens.PaymentScreenWidget.prototype;

   // Agregamos o cargamos los modulos necesarios en el POS
    models.load_models([
                                // Carga el modulo de sequencias que trae predeterminado Odoo
                                {
                                    model: 'ir.sequence', 
                                    fields: ['id','prefix','name','number_next_actual',
                                    'padding','code','vitt_number_next_actual',
                                    'vitt_min_value','vitt_max_value','fiscal_sequence_regime_ids','sequence_id','expiration_date','active','company_id'],
                                    domain:function(self){ return [['code','=','pos_order'],['active','=',true],['company_id','=',self.company.id]]}, 
                                    loaded: function(self,sequences)
                                    {self.sequences = sequences.pop();},
                                },
                                // Carga el modulo del SAR
                                {
                                    model: 'vitt_fiscal_seq.fiscal_sequence_regime', 
                                    fields: ['authorization_code_id','id','actived','_to','fiscal_sequence_regime_ids','company_id'],
                                    // domain: [['id','=',this.get_id_sequence()]],
                                    domain: function(self){ return[ [ 'actived','=', true ]] },
                                    loaded: function(self, fiscal_codes)
                                    {self.fiscal_code = fiscal_codes.pop();},
                                },

                                {
                                    model: 'vitt_fiscal_seq.authorization_code', 
                                    fields: ['name','company_id'],
                                    // domain: [['id','=',this.get_id_sequence()]],
                                    domain: function(self){ return[ [ 'active','=', true ],['company_id','=',self.company.id]] },
                                    loaded: function(self, codes)
                                    {self.codes = codes.pop();},
                                },
                        ]);



    // Order Model hacemos una herencia o extendemos el codigo donde se encuentra la funcion (export_for_printing) que impreme el POS el ticket 
screens.PaymentScreenWidget.include({
        get_date_new : function () {
            // Fecha de Expiracion...
            self = this;
            let today = new Date().toISOString().slice(0, 10)
            return today

        },
renderElement: function() {
        var self = this;
        this._super();
        this.$('.next').click(function(){
            self.order_is_valid();
        });


    },
    order_is_valid : function(force_validation){
        var self = this;
        var _expiracion_fecha = self.pos.sequences.expiration_date;
        var _today = self.get_date_new();

        if (_expiracion_fecha < _today ) {
                this.gui.show_popup('error',{
                    'title': _t('Fecha de expiracion del CAI'),
                    'body':  _t('El Fecha de expiracion del CAI ya finalizo'),
                });
                return false;
            }

        if (parseInt ( self.pos.sequences.number_next_actual ) - 1   >= parseInt ( self.pos.fiscal_code._to) ) {
                this.gui.show_popup('error',{
                    'title': _t('Fiscal secuencia del CAI'),
                    'body':  _t('La secuencia fiscal a finalizado'),
                });
                return false;

            }
        return true;
    },


});

models.Orderline = models.Orderline.extend
    ({  
    export_for_printing: function(){

        self = this;
        var _json = _super_order_line.export_for_printing.apply(this,arguments);
        _json.get_tax15 = this.get_tax15() ? this.get_tax15() : 0.00; ;
        _json.get_tax18 = this.get_tax18() ? this.get_tax18() : 0.00; ;
        _json.get_exento = this.get_exento() ? this.get_exento() : 0.00; ;
        _json.get_total_15 = this.get_total_15() ? this.get_total_15() : 0.00; ;
        _json.get_total_18 = this.get_total_18() ? this.get_total_18() : 0.00; 
        _json.get_total_excento = this.get_total_excento()? this.get_total_excento() : 0.00 ;
        return _json;
    },


    get_total_15: function(){
        // var total_15 =+ self.get_tax15();
        self = this;
        var  product =  self.get_product();
        var total15 = 0.00;

        for (var producto of product.taxes_id) {
            if (producto == 2) {
               total15 = self.get_base_price();

            };
        };
        if (total15 != 0.00) {
        // console.log(total15);
        return total15;
        };
    },
        get_total_18: function(){
        // var total_15 =+ self.get_tax15();
        self = this;
        var  product =  self.get_product();
        var total18 = 0.00;
        for (var producto of product.taxes_id) {
            if (producto == 3) {
               total18 = self.get_base_price();
              
            }
        };
        // console.log(total1);
        if (total18 != 0.00) {
        console.log(total18);
        return total18;
        };

    },

    get_total_excento: function(){
        // var total_15 =+ self.get_tax15();
        self = this;
        var  product =  self.get_product();
        var exento = 0.00;
        for (var producto of product.taxes_id) {
            if (producto == 4) {
               exento = self.get_base_price();
               
            }
        };
        // console.log(product.taxes_id)
        if (exento != 0.00) {
        // console.log(exento);
        return exento;
        };
    },

    get_tax15: function(){
        self = this;
        var  product =  self.get_product();
        var isv15 = 0.00;
        for (var producto of product.taxes_id) {
            if (producto == 2) {
               isv15 = self.get_base_price() * 0.15;
            };
        };
        // console.log(isv15);
        return isv15;
        },

    get_tax18: function(){
        self = this;
        var  product =  self.get_product();
        var isv18 = 0.00;
        for (var producto of product.taxes_id) {
            if (producto == 3) {
               isv18 = self.get_base_price() * 0.18;
            };
        };
        // console.log(isv18);
        return isv18;
        },
    get_exento: function(){
        self = this;
        var  product =  self.get_product();
        var exento = 0.00;
        for (var producto of product.taxes_id) {
            if (!producto) {
               exento = self.get_base_price();
            };
        };
        // console.log(exento);
        return exento;
        },
    
    });


    models.Order = models.Order.extend
    ({
        export_for_printing: function() 
        {
            var json = _super_order.export_for_printing.apply(this,arguments);
            json.get_min_value = this.get_min_value();
            json.get_max_value = this.get_max_value();
            json.get_expiration_date = this.get_expiration_date();
            json.get_cai = this.get_cai();
            json.get_letras = this.get_letras();
            json.get_vat =  this.get_cliente();
            json.get_date_new = this.get_date_new();
            json.get_disc_total = this.get_total_discount();
            return json;
        },



        // Agregando los parametros del SAR 
        get_expiration_date : function (sequences) {
            // Fecha de Expiracion...
            self = this;
            var expiration_date =  self.pos.sequences.expiration_date;
            return expiration_date;
        },
        get_date_new : function (sequences) {
            // Fecha de Expiracion...
            self = this;
            var date = new Date();
            return date.toLocaleString();
        },

        get_id_sequence : function (sequences) {
            // body...
            self = this;
            var id_sequence =  self.pos.sequences.id[1];
            return id_sequence;
        },

        get_min_value: function(sequences) {
            // El rango Autorizado Minimo que las facturas pueden ser impresas.
            self = this;
            var min_value =  self.pos.sequences.vitt_min_value;
            return min_value;
        },

        get_max_value: function(sequences) {
            // El rango Autorizado Maximo que las facturas pueden ser impresas.
            self = this;
            var max_value =  self.pos.sequences.vitt_max_value;
            return max_value;
        },

        get_cai: function(fiscal_code) {
            // CAI autorizado para la autoimpresion
            self = this;
            var cai =  self.pos.fiscal_code.authorization_code_id[1];
            return cai;
        },
        get_cliente :function (sequences) {
            // La direccion de la Empresa
            self = this;
            var cliente = "";
            if (self.get_client()) {
                cliente =  self.get_client().vat
            }

            return cliente;
        },
        //     // Generamos la secuencia que solicita el SAR 000-000-000-00000000 atravez de una funcion pasandole como parametro
        //     // el Numero siguiente que se creo en la secuencia del POS.
        get_number_invoice_ : function(num){ 
            function sequense(num)
                { 
                    var s = ""+ num;
                    while (s.length < 8)
                    {
                        s = "0" + s;
                    }
                    return s;
                }
            var prefix_ = this.pos.sequences.prefix;
            var num =  this.pos.sequences.number_next_actual++;
            console.log(num)

            return prefix_ + sequense(num);

        },

    get_letras : function ()
    {      
    var numeroALetras = (function() {

    function Unidades(num){

        switch(num)
        {
            case 1: return 'UN';
            case 2: return 'DOS';
            case 3: return 'TRES';
            case 4: return 'CUATRO';
            case 5: return 'CINCO';
            case 6: return 'SEIS';
            case 7: return 'SIETE';
            case 8: return 'OCHO';
            case 9: return 'NUEVE';
        }

        return '';
    }//Unidades()

    function Decenas(num){

        let decena = Math.floor(num/10);
        let unidad = num - (decena * 10);

        switch(decena)
        {
            case 1:
                switch(unidad)
                {
                    case 0: return 'DIEZ';
                    case 1: return 'ONCE';
                    case 2: return 'DOCE';
                    case 3: return 'TRECE';
                    case 4: return 'CATORCE';
                    case 5: return 'QUINCE';
                    default: return 'DIECI' + Unidades(unidad);
                }
            case 2:
                switch(unidad)
                {
                    case 0: return 'VEINTE';
                    default: return 'VEINTI' + Unidades(unidad);
                }
            case 3: return DecenasY('TREINTA', unidad);
            case 4: return DecenasY('CUARENTA', unidad);
            case 5: return DecenasY('CINCUENTA', unidad);
            case 6: return DecenasY('SESENTA', unidad);
            case 7: return DecenasY('SETENTA', unidad);
            case 8: return DecenasY('OCHENTA', unidad);
            case 9: return DecenasY('NOVENTA', unidad);
            case 0: return Unidades(unidad);
        }
    }//Unidades()

    function DecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + ' Y ' + Unidades(numUnidades)

        return strSin;
    }//DecenasY()

    function Centenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num - (centenas * 100);

        switch(centenas)
        {
            case 1:
                if (decenas > 0)
                    return 'CIENTO ' + Decenas(decenas);
                return 'CIEN';
            case 2: return 'DOSCIENTOS ' + Decenas(decenas);
            case 3: return 'TRESCIENTOS ' + Decenas(decenas);
            case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
            case 5: return 'QUINIENTOS ' + Decenas(decenas);
            case 6: return 'SEISCIENTOS ' + Decenas(decenas);
            case 7: return 'SETECIENTOS ' + Decenas(decenas);
            case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
            case 9: return 'NOVECIENTOS ' + Decenas(decenas);
        }

        return Decenas(decenas);
    }//Centenas()

    function Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let letras = '';

        if (cientos > 0)
            if (cientos > 1)
                letras = Centenas(cientos) + ' ' + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += '';

        return letras;
    }//Seccion()

    function Miles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
        let strCentenas = Centenas(resto);

        if(strMiles == '')
            return strCentenas;

        return strMiles + ' ' + strCentenas;
    }//Miles()

    function Millones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
        let strMiles = Miles(resto);

        if(strMillones == '')
            return strMiles;

        return strMillones + ' ' + strMiles;
    }//Millones()

    return function NumeroALetras(num, currency) {
        currency = currency || {};
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: '',
            letrasMonedaPlural: currency.plural || 'LEMPIRAS',//'PESOS', 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: currency.singular || 'LEMPIRA', //'PESO', 'Dólar', 'Bolivar', 'etc'
            letrasMonedaCentavoPlural: currency.centPlural || 'CENTAVOS',
            letrasMonedaCentavoSingular: currency.centSingular || 'CENTAVO'
        };

        if (data.centavos > 0) {
            data.letrasCentavos = ' CON ' + (function () {
                    if (data.centavos == 1)
                        return  ' CON ' + data.centavos+ '/100'+' '+data.letrasMonedaCentavoSingular;
                    else
                        return ' CON '  + data.centavos+ '/100'+' '+data.letrasMonedaCentavoPlural;
                })();
        };

        if(data.enteros == 0)
            return 'CERO ' + data.letrasMonedaPlural + ' ' + data.centavos+ '/100';
        if (data.enteros == 1)
            return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' CON ' + data.centavos + '/100' + ' ' + data.letrasMonedaCentavoPlural;
        else
            return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' CON ' + data.centavos + '/100'+ ' ' + data.letrasMonedaCentavoPlural;
    };

})();
        var total = this.get_total_with_tax();
        return numeroALetras(total);

        },
    
    });

});
