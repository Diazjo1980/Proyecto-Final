sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        function onInit() {         
           
        };

        function navToCreateEmployee() { 
            //Obtenemos el router del componente de la aplicación
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //Realizamos la navegación al CreateEmployee
            oRouter.navTo("CreateEmployee", {}, false);
        };

        function navToShowEmployee() { 
            //Obtenemos el router del componente de la aplicación
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //Realizamos la navegación al ShowEmployee
            oRouter.navTo("ShowEmployee", {}, false);

        };

        function navToFirmarPedidos() {
            window.open('https://cfecfe9ctrial-dev-employees2-approuter.cfapps.us10.hana.ondemand.com/logaligroupemployees/index.html', '_blank');
        };

        let Menu = Controller.extend("logaligroup.finalproject.controller.Menu", {

        });

        Menu.prototype.onInit = onInit;
        Menu.prototype.navToCreateEmployee = navToCreateEmployee;
        Menu.prototype.navToShowEmployee = navToShowEmployee;
        Menu.prototype.navToFirmarPedidos = navToFirmarPedidos;

        return Menu;


    });