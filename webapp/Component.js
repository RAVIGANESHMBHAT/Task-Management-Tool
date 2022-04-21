sap.ui.define(
  [
    "sap/base/util/UriParameters",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/ui/Device",
    "com/ravi/dissertation/TaskManagementTool/model/models",
  ],
  function (UriParameters, UIComponent, JSONModel, library, FlexibleColumnLayoutSemanticHelper,  Device, models) {
    "use strict";

    const LayoutType = library.LayoutType;

    return UIComponent.extend("com.ravi.dissertation.TaskManagementTool.Component", {
      metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // enable routing
        this.getRouter().initialize();

        const oModel = new JSONModel();
        this.setModel(oModel);

        // set the device model
        //this.setModel(models.createDeviceModel(), "device");
      },

      getHelper: function () {
        var oFCL = this.getRootControl().byId("fcl"),
          oParams = UriParameters.fromQuery(location.search),
          oSettings = {
            defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
            mode: oParams.get("mode"),
            initialColumnsCount: oParams.get("initial"),
            maxColumnsCount: oParams.get("max")
          };

        return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
      }
    });
  }
);
