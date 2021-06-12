sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "imagina/employees/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Controller, MessageBox, models, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("imagina.employees.controller.VerEmpleado", {
        onInit: function () {

            //Se crea un modelo para guardar usuario seleccionado en la lista
            this.getView().setModel(models.createSelEmployeeModel(), "selEmployee");
            //Se crea un modelo para guardar los ascensos
            this.getView().setModel(models.createNewRiseEmployeeModel(), "newRiseEmployee");
        },


        //Función para volver atras
        handleBack: function () {
            // vamos al menu
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.getOwnerComponent().getRouter().navTo("RouteMain");
        },

        //Funcion para filtrar empleados de la lista
        handleSearchEmployee: function (oEvent) {
            var value = oEvent.getSource().getValue();
            var filters = [];
            if (value && value.length > 0) {
                filters.push(new Filter("EmployeeId", FilterOperator.Contains, value));
            }

            var oList = this.getView().byId("standardList"); //obtener listado de la tabla para que se actulice
            var oBinding = oList.getBinding("items"); //se le pasa los items de la tabla
            oBinding.filter(filters);
        },

        //al seleccionar un empleado de la lista
        onSelectEmployee: function (oEvent) {
            //Se recupera el  item seleccionado
            var selectedItem = oEvent.getParameter("listItem").getBindingContext("odataModel").getProperty();
            //Se recupera el id del item seleccionado
            var selectedItemId = selectedItem.EmployeeId;
            //se recupera las propiedades del elemeto id
            var detailEmployee = this.byId("detailEmployee");
            //Se pasa los datos ya filtrados del odata con el id del item seleccionado 
            detailEmployee.bindElement("odataModel>/Users(EmployeeId='" + selectedItemId + "',SapId='" + this.getOwnerComponent().SapId + "')");
            //Se pasa el empleado seleccionado a un modelo
            var oModelSelEmployee = this.getView().getModel("selEmployee");
            oModelSelEmployee.setProperty("/employeeId", selectedItem.EmployeeId);
            oModelSelEmployee.setProperty("/tipoEmpleado", selectedItem.Type);
            oModelSelEmployee.setProperty("/dniCif", selectedItem.Dni);
            //Se utiliza las propiedades del SplitApp para navegar entre las paginas    
            var SplitApp = this.byId("employeeList");
            //Vamos a la pagina de los detalle del empleado seleccionado
            SplitApp.to(this.createId("detailEmployee"));
        },


        //Se borra el fichero en el odata
        onFileDeleted: function (oEvent) {
            var oUploadCollection = oEvent.getSource();
            var sPath = oEvent.getParameter("item").getBindingContext("odataModel").getPath();
            this.getView().getModel("odataModel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();//refrescar el modelo despues de eliminar
                },
                error: function () {

                }
            });
        },

        //Descargar fichero
        downloadFile: function (oEvent) {
            const sPath = oEvent.getSource().getBindingContext("odataModel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
        },

        //lógica previa a la subida del fichero que añade en la cabecera de la llamada al servicio OData el parámetro SLUG 
        onFileBeforeUpload: function (oEvent) {
            //Se recupera el valor del usuario recien creado
            var oModelNewEmployee = this.getView().getModel("selEmployee").getData();
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

        },

        //Dar de baja un empleado 
        handleDeleteEmployee: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            //Se recupera el id del empleado seleccionado guardado antes en el modelo selEmployee
            var selEmployee = this.getView().getModel("selEmployee").getData("");
            var selEmployeeId = selEmployee.employeeId;

            var SapId = this.getOwnerComponent().SapId;
            var odataModel = this.getView().getModel("odataModel");

            //Se utiliza las propiedades del SplitApp para navegar entre las paginas    
            var SplitApp = this.byId("employeeList");
            //Vamos a la pagina de los detalle del empleado seleccionado
            var detailSelectEmployee = this.createId("detailSelectEmployee");

            //Mensaje de confimmación para borrar empleado
            MessageBox.confirm(oResourceBundle.getText("textConfirmDelete"), {
                title: oResourceBundle.getText("titleConfirm"),
                onClose: function (oACtion) {
                    if (oACtion === "OK") {
                        //Se llama a la función para borrar el usuario en el odata
                        odataModel.remove("/Users(EmployeeId='" + selEmployeeId + "',SapId='" + SapId + "')", {
                            success: function (data) {
                                sap.m.MessageToast.show(oResourceBundle.getText("employeeDelete"));
                                //Se vuelve a carga la pantalla con el mensaje "Seleecione empleado"                               
                                SplitApp.to(detailSelectEmployee);
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }.bind(this)
                        });
                    }
                }
            });
        },

        //ascender un empleado
        handleRiseEmployee: function (oEvent) {
            if (!this.riseDialog) {
                //Se crea con el fragment RiseEmployee un popup dialogo
                this.riseDialog = sap.ui.xmlfragment("imagina.employees.fragment.EmployeeRise", this);
                this.getView().addDependent(this.riseDialog);
            }
            //A partir de los campos del dialogo se crea un modelo 
            //this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}), "NewRiseEmployee");
            //Se abre el dialogo
            this.riseDialog.open();
        },

        //Añadir un nuevo ascenso
        handleAddRise: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            //Se recupera el id del empleado seleccionado guardado antes en el modelo selEmployee
            var selEmployee = this.getView().getModel("selEmployee").getData();
            var selEmployeeId = selEmployee.employeeId;
            //Se recupera los datos introducidos por el dialogo en el modelo  NewRiseEmployee
            var newRise = this.getView().getModel("newRiseEmployee").getData();
            var oModelnewRise = this.getView().getModel("newRiseEmployee");
            //Se llama a la función para crear un nuevo ascenso del empleado en el odata
            var body = {
                Ammount: newRise.Ammount,
                CreationDate: newRise.CreationDate,
                Comments: newRise.Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: selEmployeeId
            };
            this.getView().getModel("odataModel").create("/Salaries", body, {
                success: function () {
                    sap.m.MessageToast.show(oResourceBundle.getText("riseOk"));
                    this.handleCloseRiseDialog();

                }.bind(this),
                error: function () {

                    sap.m.MessageToast.show(oResourceBundle.getText("riseError"));
                }.bind(this)
            });
            //Se borra datos del modelo newRiseEmployee           
            oModelnewRise.setData(null);
        },

        //Cerrar dialogo de ascenso
        handleCloseRiseDialog: function (oEvent) {
            this.riseDialog.close();
        }

    });
});