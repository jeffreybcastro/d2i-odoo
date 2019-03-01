odoo.define('pos_ticket.models_extend', function (require){
    "use strict";
    var models = require('point_of_sale.models');
    var _super_order = models.Order.prototype;
   // Agregamos o cargamos los modulos necesarios en el POS
    models.load_models([
                                // Carga el modulo de sequencias que trae predeterminado Odoo
                                {
                                    model: 'ir.sequence', 
                                    fields: 
                                    [
                                        'code',
                                        'number_next_actual',
                                        'vitt_min_value',
                                        'vitt_max_value',
                                        'fiscal_sequence_regime_ids',
                                        'expiration_date',
                                        'active',   
                                        'prefix',
                                        'id'
                                    ], 
                                    domain: [['code','=','pos_order'],['active','=',true]], 
                                    loaded: function(self,sequences)
                                    {self.sequences = sequences[0];},
                                },
                                // Carga el modulo del SAR
                                // {
                                //     model: 'vitt_fiscal_seq.fiscal_sequence_regime', 
                                //     fields: ['authorization_code_id','id','actived','sequence_id'],
                                //     // domain: [['id','=',this.get_id_sequence()]],
                                //     domain: function(self){ return [['actived','=', true ],['sequence_id','=', self.pos.sequences.fiscal_sequence_regime_ids ]]; },
                                //     loaded: function(self, fiscal_codes)
                                //     {self.fiscal_code = fiscal_codes[0];},
                                // },
                        ]);

    // Order Model hacemos una herencia o extendemos el codigo donde se encuentra la funcion (export_for_printing) que impreme el POS el ticket 
    models.Order = models.Order.extend
    ({

        // export_for_printing: function() 
        // {
        //     var json = _super_order.export_for_printing.apply(this,arguments);
        //     json.subtotal_in_words = this.get_subtotal_in_words();
        //     json.get_min_value = this.get_min_value();
        //     json.get_max_value = this.get_max_value();
        //     return json;

        // },

        // Agregando los parametros del SAR 
        get_expiration_date : function (sequences) {
            // Fecha de Expiracion...
            self = this;
            var expiration_date =  self.pos.sequences.expiration_date;
            return expiration_date;
        },

        // get_id_sequence : function (sequences) {
        //     // body...
        //     self = this;
        //     var id_sequence =  self.pos.sequences.id[1];
        //     return id_sequence;
        // },

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

        // get_cai: function(fiscal_code) {
        //     // CAI autorizado para la autoimpresion
        //     self = this;
        //     var cai =  self.pos.fiscal_code.authorization_code_id[1];
        // //     return cai;
        // // },
        // get_addre :function (companies) {
        //     // La direccion de la Empresa
        //     self = this;
        //     get_addre =  self.pos.companies.street;
        //     return get_addre;
        // },

        // get_number_invoice: function(sequences){
        //     // Generamos la secuencia que solicita el SAR 000-000-000-00000000 atravez de una funcion pasandole como parametro
        //     // el Numero siguiente que se creo en la secuencia del POS.
        //     self = this;
        //     var prefix_ = self.pos.sequences.prefix;

        //     function sequense(num)
        //         { 
        //             var s = ""+ num;
        //             while (s.length < 8)
        //             {
        //                 s = "0" + s;
        //             }
        //             return s;
        //         }
        //     var num =  self.pos.sequences.number_next_actual++;

        //     return prefix_ + sequense(num);
        //     // Funciones que trae el POS predeterminado
        //     // this.pos.click_next();
        //     // this.pos.set_next_number.destroy();
        // },


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
        // var centavos= parseInt((Math.round(total-total,2))*100)
        // var converted = "";
        // var centavos = total;
        // if(centavos)>0{
        //     converted += "con " + centavos + "/100"
        // };


        return numeroALetras(total);

        },
    
    });
});

