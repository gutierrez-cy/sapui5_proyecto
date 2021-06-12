sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {

        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        createEmployeeModel: function () {
            return new JSONModel({
                tipoEmpleado: "",
                nombre: "",
                apellido: "",
                dniCif: "",
                salario: 0,
                fechaIncorporacion: null,
                comentario: "",
                numAdjunto: 0,
                files: [{
                    DocName: "",
                    MimeType: ""
                }]
            });
        },

        createSliderModel: function () {
            return new JSONModel({
                value: 0,
                min: 0,
                max: 0,
                step: 0,
                visible: true
            });
        },

        createErrorModel: function () {
            return new JSONModel({
                nombreState: "None",
                apellidoState: "None",
                dniState: "None",
                dateState: "None"
            });
        },

        createNewEmployeeModel: function () {
            return new JSONModel({
                employeeId: "",
                tipoEmpleado: "",
                dniCif: ""
            });
        },

        createSelEmployeeModel: function () {
            return new JSONModel({
                employeeId: "",
                tipoEmpleado: "",
                dniCif: ""
            });
        },

        createNewRiseEmployeeModel: function () {
            return new JSONModel({
                Ammount: 0,
                CreationDate: null,
                Comments: ""
            });
        },
    };
});