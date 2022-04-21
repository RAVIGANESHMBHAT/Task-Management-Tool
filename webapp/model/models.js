sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (JSONModel, Device) {
  "use strict";

  return {
    // createDeviceModel: function () {
    //   var oModel = new JSONModel(Device);
    //   oModel.setDefaultBindingMode("OneWay");
    //   return oModel;
    // },

    loadUserModel: function () {
      let oUserModel = {
        "id": "I" + Math.floor(Math.random() * 500) + 1000,
        "name": "",
        "role": "",
        "password": ""
      };

      let oModel = new JSONModel(oUserModel);
      return oModel;
    }
  };
});
