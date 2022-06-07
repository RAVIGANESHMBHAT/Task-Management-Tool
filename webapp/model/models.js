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
    },

    createProjectModel: function () {
      let oProjectModel = {
        projectId: Date.now().toString(),
        generatedProjectNo: Math.floor(Math.random() * 90000) + 10000,
        projectCode: "",
        projectName: "",
      };

      let oModel = new JSONModel(oProjectModel);
      return oModel;
    },

    createTaskModel: function () {
      var oTaskModel = {
        projectId: "",
        generatedProjectNo: Math.floor(Math.random() * 90000) + 10000,
        projectCode: "",
        projectName: "",
        tasks: {
          taskTypeCode: null,
          taskTypeName: "",
          taskTitle: "",
          taskDescription: "",
          taskAssigneeId: null,
          taskAssigneeName: "",
          taskPrioCode: null,
          taskPriorityName: "",
          taskStatusCode: "0",
          taskStatus: "Open",
          taskComments: [],
          taskAttachments: {
            "items": []
          }

        }
      };

      let oModel = new JSONModel(oTaskModel);
      return oModel;
    },

  };
});
