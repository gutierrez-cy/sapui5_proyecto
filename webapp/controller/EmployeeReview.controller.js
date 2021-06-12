sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"imagina/employees/model/models"
], function (Controller, MessageBox, models) {
	"use strict";

	return Controller.extend("imagina.employees.controller.EmployeeReview", {
		onInit: function () {
			//Modelo Employee
			//var oModelEmployee = this.getView().getModel("employee");

			var oModel = sap.ui.getCore().getModel("employee");

			this.getView().setModel(oModel, "employeeReview");

			//Se crea un modelo para la etiqueta Empleado
			//this.getView().setModel(models.createEmployeeModel(), "employee1");

			//this.getView().setModel(oModel, "employee1");
		},


editarPaso1: function() {
	
}

	});

});