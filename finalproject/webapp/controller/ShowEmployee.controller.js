sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator      
     */
    function (Controller, History, Filter, FilterOperator) {
        "use strict";

        function onInit() {
            this._splitAppEmployee = this.byId("splitAppEmployee");
        };

        function _onObjectMatched(oEvent) {

            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("ShowEmployee").attachPatternMatched(_onObjectMatched, this);
        };

        //Función al pulsar "<" para regresar al menú
        function onPressBack() {

            let oHistory = History.getInstance();
            let sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash === "ShowEmployee") {
                window.history.go(-1);
            } else {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("menu", {}, true);
            }

        };

        //Función para filtrar empleados
        function onSearchEmployee(oEvent) {

            // 
            let aFilters = [];
            let sQuery = oEvent.getSource().getValue();
            if (sQuery && sQuery.length > 0) {
                let filter = new Filter({filter: [new Filter({ path: "FirstName", operator: FilterOperator.Contains, value1: sQuery }), 
                                                  new Filter({ path: "SapId", operator: 'EQ', value1: this.getOwnerComponent().SapId }) ] });
                              
                aFilters.push(filter);

            } else {
                let filter = new Filter({filter: [new Filter({ path: "SapId", operator: 'EQ', value1: this.getOwnerComponent().SapId }) ] });
                aFilters.push(filter);
            }

            // Actualizar la lista ya sea por filtro o por nuestro SapId
            let oList = this.byId("listSelectedEmployee");
            let oBinding = oList.getBinding("items");
            oBinding.filter(aFilters, "Application");

        };

        //Función al seleccionar un empleado
        function onSelectEmployee(oEvent) {

            //Se navega al detalle del empleado
            this._splitAppEmployee.to(this.createId("detailEmployee"));
            let context = oEvent.getParameter("listItem").getBindingContext("odatamodel");
            //Se almacena el usuario seleccionado
            this.employeeId = context.getProperty("EmployeeId");
            var detailEmployee = this.byId("detailEmployee");
            //Se bindea a la vista con la entidad Users y las claves del id del empleado y el id del Component.js
            detailEmployee.bindElement("odatamodel>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");

        };

        //Función para eliminar el empleado seleccionado
        function onDeleteEmployee(oEvent) {
            //Se muestra un mensaje de confirmación
            sap.m.MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("eliminar"), {
                title: this.getView().getModel("i18n").getResourceBundle().getText("confirm"),
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        //Se llama a la función remove
                        this.getView().getModel("odatamodel").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                            success: function (data) {
                                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("usuarioEliminado"));
                                //En el detalle se muestra el mensaje "Seleecione empleado"
                                this._splitAppEmployee.to(this.createId("detailSelectEmployee"));
                            }.bind(this),
                            error: function (e) {
                                sap.base.Log.info(e);
                            }.bind(this)
                        });
                    }
                }.bind(this)
            });
        };

        //Función para ascender a un empleado
        function onRiseEmployee(oEvent) {
            if (!this.riseDialog) {

                this.riseDialog = sap.ui.xmlfragment("logaligroup/finalproject/fragment/RiseEmployee", this);
                this.getView().addDependent(this.riseDialog);
            }
            this.riseDialog.setModel(new sap.ui.model.json.JSONModel({}), "newRise");
            this.riseDialog.open();
        };

        //Función para cerrar el dialogo
        function onCloseRiseDialog() {
            this.riseDialog.close();
        };

        //Función para crear un nuevo ascenso
        function addRise(oEvent) {
            //Se obtiene el modelo newRise
            let newRise = this.riseDialog.getModel("newRise");
            //Se obtiene los datos
            let odata = newRise.getData();
            //Se prepara la informacion para enviar a sap y se agrega el campo sapId con el id del component y el id del empleado
            let body = {
                Amount: odata.Amount,
                CreationDate: odata.CreationDate,
                Comments: odata.Comments,
                SapId: this.getOwnerComponent().SapId,
                EmployeeId: this.employeeId
            };
            this.getView().setBusy(true);
            this.getView().getModel("odatamodel").create("/Salaries", body, {
                success: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoCorrecto"));
                    this.onCloseRiseDialog();
                }.bind(this),
                error: function () {
                    this.getView().setBusy(false);
                    sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("ascensoError"));
                }.bind(this)
            });

        };

        //Función que se ejecuta por cada fichero que se va a subir a sap
        //Se debe agregar el parametro de cabecera "slug" con el valor "id de sap del alumno",id del nuevo usuario y nombre del fichero, separados por ;
        function onBeforeUploadStart(oEvent) {
            let oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                name: "slug",
                value: this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oEvent.getParameter("fileName")
            });
            oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        };

        function onUploadComplete(oEvent) {
            let oUploadCollection = oEvent.getSource();
            oUploadCollection.getBinding("items").refresh();
        };

        function onFileDeleted(oEvent) {
            let oUploadCollection = oEvent.getSource();
            let sPath = oEvent.getParameter("item").getBindingContext("odatamodel").getPath();
            this.getView().getModel("odatamodel").remove(sPath, {
                success: function () {
                    oUploadCollection.getBinding("items").refresh();
                },
                error: function () {

                }
            });
        };

        function downloadFile(oEvent) {
            let sPath = oEvent.getSource().getBindingContext("odatamodel").getPath();
            window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
        };

        let ShowEmployees = Controller.extend("logaligroup.finalproject.controller.ShowEmployee", {

        });

        ShowEmployees.prototype.onInit = onInit;
        ShowEmployees.prototype.onPressBack = onPressBack;
        ShowEmployees.prototype.onSearchEmployee = onSearchEmployee;
        ShowEmployees.prototype.onSelectEmployee = onSelectEmployee;
        ShowEmployees.prototype.onDeleteEmployee = onDeleteEmployee;
        ShowEmployees.prototype.onRiseEmployee = onRiseEmployee;
        ShowEmployees.prototype.onCloseRiseDialog = onCloseRiseDialog;
        ShowEmployees.prototype.addRise = addRise;
        ShowEmployees.prototype.onBeforeUploadStart = onBeforeUploadStart;
        ShowEmployees.prototype.onUploadComplete = onUploadComplete;
        ShowEmployees.prototype.onFileDeleted = onFileDeleted;
        ShowEmployees.prototype.downloadFile = downloadFile;


        return ShowEmployees;


    });