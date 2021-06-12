sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "imagina/employees/model/models"
], function (Controller, MessageBox, models) {
    "use strict";

    return Controller.extend("imagina.employees.controller.CrearEmpleado", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf imagina.employees.view.CrearEmpleado
		 */
        onInit: function () {
            var oModel = models.createEmployeeModel();
            //Se crea un modelo para los datos del empleado
            //this.getView().setModel(models.createEmployeeModel(), "employee");
            this.getView().setModel(oModel, "employee");
            sap.ui.getCore().setModel(oModel, "employee");
            //Se crea un modelo para la etiqueta slider
            this.getView().setModel(models.createSliderModel(), "slider");

            //Se crea un modelo para los errores
            this.getView().setModel(models.createErrorModel(), "error");

            //Se crea un modelo para el usuario nuevo creado en el odata
            this.getView().setModel(models.createNewEmployeeModel(), "newEmployee");
        },

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf imagina.employees.view.CrearEmpleado
		 */
        //	onBeforeRendering: function() {
        //
        //	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf imagina.employees.view.CrearEmpleado
		 */
        //	onAfterRendering: function() {
        //
        //	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf imagina.employees.view.CrearEmpleado
		 */
        //	onExit: function() {
        //
        //	}

        i18n: function (sCode) {
            this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sCode);
        },

        handleCancelButtonPress: function () {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            var that = this;
            MessageBox.warning(oResourceBundle.getText("cancelMsg"), {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        //Se borra datos del lodelo Employee
                        var oModel = sap.ui.getCore().getModel("employee");
                        oModel.setData(null);
                        
                        //Se hace que el wirzard se resetee al paso 1
                        var oWizard = that.byId("CreateEmployeeWizard");
                        var oWizardStep1 = that.getView().byId("ProductTypeStep");
                        oWizard.goToStep(oWizardStep1);
                        var navCon = that.byId("navCon");
                        navCon.back();

                        that.getOwnerComponent().getRouter().navTo("RouteMain");
                    }
                }
            });
        },
        //ir al paso 2
        handleNextStep: function (oEvent) {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee");
            //Modelo Slider
            var oModelSlider = this.getView().getModel("slider");

            //Se obtiene el tipo de empleado seleccionado en el paso 1 con el "CustomData"
            var boton = oEvent.getSource();
            var typeEmployee = boton.data("typeEmployee");
            //Se pasa al modelo el tipo de empleado
            oModelEmployee.setProperty("/tipoEmpleado", typeEmployee);

            //Dependiendo del tipo de empleado se modifica el modelo slider con distintas carectaeriscas 
            switch (typeEmployee) {
                //interno
                case "interno":
                    oModelSlider.setProperty("/value", 24000);
                    oModelSlider.setProperty("/min", 12000);
                    oModelSlider.setProperty("/max", 80000);
                    oModelSlider.setProperty("/step", 1000);
                    break;
                //gerente
                case "gerente":
                    oModelSlider.setProperty("/value", 70000);
                    oModelSlider.setProperty("/min", 50000);
                    oModelSlider.setProperty("/max", 200000);
                    oModelSlider.setProperty("/step", 1000);
                    break;
                //autonomo
                case "autonomo":
                    oModelSlider.setProperty("/value", 400);
                    oModelSlider.setProperty("/min", 100);
                    oModelSlider.setProperty("/max", 2000);
                    oModelSlider.setProperty("/step", 100);
                    break;
                default:
                    break;
            }

            //Se obtiene datos del wizard
            var oWizard = this.byId("CreateEmployeeWizard");
            //Se obtiene datos del paso 1
            var oWizardStep1 = this.getView().byId("ProductTypeStep");
            //Se obtiene datos del paso 2
            var oWizardStep2 = this.getView().byId("EmployeeForm");
            //si estamos en el paso 1, se acativa el paso 2 .
            if (oWizard.getCurrentStep() === oWizardStep1.getId()) {
                oWizard.nextStep();
            } else {
                //Si se ha activado el paso 2, vamos directos al formulario
                oWizard.goToStep(oWizardStep2);
            }
        },
        //Validación formato dni
        handleValidacionDni: function (oEvent) {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee").getData();
            //Modelo Errores
            var oModelError = this.getView().getModel("error");
            //Tipo de empleado
            var tipoEmpleado = oModelEmployee.tipoEmpleado;
            if (tipoEmpleado !== "autonomo") {
                //Solo para interno y gerente
                var dni = oEvent.getParameter("value");
                var number;
                var letter;
                var letterList;
                var regularExp = /^\d{8}[a-zA-Z]$/;
                //Se comprueba que el formato es válido
                if (regularExp.test(dni) === true) {
                    //Número
                    number = dni.substr(0, dni.length - 1);
                    //Letra
                    letter = dni.substr(dni.length - 1, 1);
                    number = number % 23;
                    letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                    letterList = letterList.substring(number, number + 1);
                    if (letterList !== letter.toUpperCase()) {
                        oModelError.setProperty("/dniState", "Error"); //Se pasa el error al modelo error que lo asignará al valueState de la etiqueta
                    } else {
                        oModelError.setProperty("/dniState", "None"); //Se pasa el None al modelo error que lo asignará al valueState de la etiqueta
                    }
                } else {
                    oModelError.setProperty("/dniState", "Error"); //Se pasa el error al modelo error que lo asignará al valueState de la etiqueta
                }
            }
        },

        //Validación campos vacios del formulario del paso2
        hadleValidacionNombre: function () {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee").getData();
            //Modelo Errores
            var oModelError = this.getView().getModel("error");
            //Nombre
            if (oModelEmployee.nombre === "") {
                oModelError.setProperty("/nombreState", "Error"); //Se pasa el error al modelo error que lo asignará al valueState de la etiqueta
            } else {
                oModelError.setProperty("/nombreState", "None");
            }
        },
        //Validación campos vacios del formulario del paso2
        hadleValidacionApellido: function () {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee").getData();
            //Modelo Errores
            var oModelError = this.getView().getModel("error");

            //Apellidos
            if (oModelEmployee.apellido === "") {
                oModelError.setProperty("/apellidoState", "Error"); //Se pasa el error al modelo error que lo asignará al valueState de la etiqueta
            } else {
                oModelError.setProperty("/apellidoState", "None");
            }
        },
        //Validación campos vacios del formulario del paso2
        hadleValidacionFecha: function (oEvent) {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee").getData();
            //Modelo Errores
            var oModelError = this.getView().getModel("error");

            //Fecha Incorporación
            if (oModelEmployee.fechaIncorporacion === "null") {
                oModelError.setProperty("/dateState", "Error"); //Se pasa el error al modelo error que lo asignará al valueState de la etiqueta
            } else {
                oModelError.setProperty("/dateState", "None");
            }
        },

        //Función al dar al botón verificar del paso 3
        wizardCompletedHandler: function (oEvent) {
            //Modelo Employee
            var oModelEmployee = this.getView().getModel("employee");

            //Se obtiene los archivos adjuntados
            var uploadCollection = this.byId("UploadCollection");
            var files = uploadCollection.getItems();
            var numFiles = uploadCollection.getItems().length;
            oModelEmployee.setProperty("/numAdjunto", numFiles);
            if (numFiles > 0) {
                var arrayFiles = [];
                for (var i in files) {
                    arrayFiles.push({
                        DocName: files[i].getFileName(),
                        MimeType: files[i].getMimeType()
                    });
                }
                oModelEmployee.setProperty("/files", arrayFiles);
            } else {
                oModelEmployee.setProperty("/files", []);
            }

            //Se nevega a la vista "Employee Review", con el sap.m.NavContainer
            var navCon = this.byId("navCon");
            var animation = "baseSlide";
            navCon.to(this.byId("EmployeeReview"), animation);

        },

        hadleEditarPaso1: function (oEvent) {
            //Se obtiene datos del wizard
            var oWizard = this.byId("CreateEmployeeWizard");
            //Se obtiene datos del paso 1
            var oWizardStep1 = this.getView().byId("ProductTypeStep");
            //Se va al paso 1
            oWizard.goToStep(oWizardStep1);

            var navCon = this.byId("navCon");
            navCon.back();
        },
        hadleEditarPaso2: function (oEvent) {
            //Se obtiene datos del wizard
            var oWizard = this.byId("CreateEmployeeWizard");
            //Se obtiene datos del paso 2
            var oWizardStep2 = this.getView().byId("EmployeeForm");
            //Se va al paso 2
            oWizard.goToStep(oWizardStep2);

            var navCon = this.byId("navCon");
            navCon.back();
        },
        hadleEditarPaso3: function (oEvent) {
            //Se obtiene datos del wizard
            var oWizard = this.byId("CreateEmployeeWizard");
            //Se obtiene datos del paso 3
            var oWizardStep3 = this.getView().byId("OptionalInfoStep");
            //Se va al paso 3
            oWizard.goToStep(oWizardStep3);

            var navCon = this.byId("navCon");
            navCon.back();
        },


        //Grabar empleado en el odata
        hadleSaveEmployee: function (oEvent) {
            //Necesito saber cuantos usuarios se han creado, para enviar el Id siguiente al odata
            var EmployeeId = "";
            var odataEmployee = this.getView().getModel("odataModel");
            var odata = odataEmployee.oData;
            var index = 0;
            for (var i in odata) {
                index = index + 1;
            };
            index = index + 1;
            EmployeeId = index.toString();

            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            //var employeeId = this._detailEmployeeView.getBindingContext("odataNorthwind").getObject().EmployeeID;
            var oModelEmployee = this.getView().getModel("employee").getData();
            var oModelNewEmployee = this.getView().getModel("newEmployee");
            //Dependiendo del tipo de empleado se modifica el modelo slider con distintas carecteriscas 
            var employeetype = "";
            switch (oModelEmployee.tipoEmpleado) {
                //interno
                case "interno":
                    employeetype = "0";
                    break;
                //gerente
                case "gerente":
                    employeetype = "1";
                    break;
                //autonomo
                case "autonomo":
                    employeetype = "2";
                    break;
                default:
                    break;
            }

            var body = {
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: EmployeeId,
                CreationDate: oModelEmployee.fechaIncorporacion,
                Type: employeetype,
                FirstName: oModelEmployee.nombre,
                LastName: oModelEmployee.apellido,
                Dni: oModelEmployee.dniCif,
                Comments: oModelEmployee.comentario,
                UserToSalary: [{
                    Ammount: oModelEmployee.salario.toString(),
                    Comments: oModelEmployee.comentario,
                    Waers: "EUR"
                }]
            };
            //Se llama a la función para crear el usuario en el odata
            this.getView().getModel("odataModel").create("/Users", body, {
                success: function (data) {
                    sap.m.MessageToast.show(oResourceBundle.getText("odataSaveOK"));
                    //Se pasan los datos creados en el odata a un modelo
                    oModelNewEmployee.setProperty("/employeeId", data.EmployeeId);
                    oModelNewEmployee.setProperty("/tipoEmpleado", data.Type);
                    oModelNewEmployee.setProperty("/dniCif", data.Dni);
                    //Se cargan los ficheros seleccionados
                    this._startUpload();
                    //Se hace que el wirzard se resetee al paso 1
                    var navCon = this.byId("navCon");
                    navCon.back();
                    //Volvemos a la view principal
                    this.getOwnerComponent().getRouter().navTo("RouteMain");
                }.bind(this),
                error: function (e) {
                    sap.m.MessageToast.show(oResourceBundle.getText("odataSaveKO"));
                }.bind(this)
            });

        },

        //lógica previa a la subida del fichero que añade en la cabecera de la llamada al servicio OData el parámetro SLUG 
        onFileBeforeUpload: function (oEvent) {
            //Se recupera el valor del usuario recien creado
            var oModelNewEmployee = this.getView().getModel("newEmployee").getData();
            var newEmployeeId = oModelNewEmployee.employeeId;
            //Se recupera el nombre del fichero adjunto
            let fileName = oEvent.getParameter("fileName");

            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + newEmployeeId + ";" + fileName
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },

        //cada vez que se carga un fichero se añade parametro
        onFileChange: function (oEvent) {
            let oUplodCollection = oEvent.getSource();
            // Header Token CSRF - Cross-site request forgery
            let oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("odataModel").getSecurityToken()//Se recupera el token que el odata devuelve
            });
            oUplodCollection.addHeaderParameter(oCustomerHeaderToken);
        },

        //Refrescar el modelo, una vez guardado el fichero en el odata
        onFileUploadComplete: function (oEvent) {
            //Se borra datos del modelo Employee
            var oModel = sap.ui.getCore().getModel("employee");
            oModel.setData(null);
            //Se borra datos del modelo newEmployee
            var oModelNew = sap.ui.getCore().getModel("newEmployee");
            oModelNew.setData(null);
        },

        _startUpload: function () {
            var that = this;
            var oUploadCollection = that.byId("UploadCollection");
            oUploadCollection.upload();
        },

    });

});