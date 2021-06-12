sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("imagina.employees.controller.Main", {
        onInit: function () {
        
        },

        onBeforeRendering: function (oEvent) {
            var odataModel = this.getView().getModel("odataModel");
            var odata = odataModel.oData;
            var index = 0;
            for (var i in odata) {
                index = index + 1;
            };
            if (index === 0) {
                // se cargan los datos del odata existentes    
                odataModel.read("/Users", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId),
                    ],
                    success: function (data) {
                        //odataModel.setData(data.results);
                    }.bind(this),
                    error: function (e) {
                    }
                });
            };
        },

        onAfterRendering: function () {
            // Error en el framework: Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL, // pero no funciona en la versión 1.78. Por tanto, una solución encontrada es eliminando la propiedad id del componente por jquery
            //var genericTileFirmarPedido = this.byId("linkFirmarPedido");
            //Id del dom
            //var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
            //Se vacía el id
            //jQuery("#" + idGenericTileFirmarPedido)[0].id = "";
        },

        //función que se llama al pulsar en "crear empleado" de la pagina principal
        handleCreateTilePress: function (oEvent) {
            var evt = oEvent;
            //Se nevega a la vista "Crear empleado", configurada en el route del manifest
            this.getOwnerComponent().getRouter().navTo("CrearEmpleado");
        },

        //función que se llama al pulsar en "ver empleado" de la pagina principal
        handleShowTilePress: function (oEvent) {
            var evt = oEvent;
            //Se nevega a la vista "Crear empleado", configurada en el route del manifest
            this.getOwnerComponent().getRouter().navTo("VerEmpleado");
        },

        // función que se llama al pulsar en "firmar pedido" de la pagina principal
         handleUrl: function (oEvent) {
             var url = " https://2c39b16atrial-dev-employees-approuter.cfapps.eu10.hana.ondemand.com/logaligroupemployees/index.html";
             window.open( url,"_blank");           
         }
    });
});