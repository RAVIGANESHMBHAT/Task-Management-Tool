sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "taskmanagementtool/model/models",
    "sap/base/util/UriParameters",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/f/library",
    "taskmanagementtool/helpers/Api",
    "sap/ui/model/json/JSONModel",
    "taskmanagementtool/helpers/ApiHandlers",
  ],
  function (UIComponent, Device, models, UriParameters, FlexibleColumnLayoutSemanticHelper, library, Api, JSONModel, ApiHandlers) {
    "use strict";

    const LayoutType = library.LayoutType;

    return UIComponent.extend("taskmanagementtool.Component", {
      metadata: {
        manifest: "json"
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

        // set the device model
        this.setModel(models.createDeviceModel(), "device");

        const oModel = new JSONModel();
        this.setModel(oModel, "layoutModel");

        const oMasterTaskManagementModel = new JSONModel();
        this.setModel(oMasterTaskManagementModel, "masterTaskManagementModel");

        const oProjectModel = new JSONModel();
        this.setModel(oProjectModel, "projectModel");

        const oTaskTypesModel = new JSONModel([
          {
            "name": "Bug",
            "taskTypeCode": 0,
            "icon": "sap-icon://quality-issue"
          },
          {
            "name": "Backlog",
            "taskTypeCode": 1,
            "icon": "sap-icon://activities"
          },
          {
            "name": "User Story",
            "taskTypeCode": 2,
            "icon": "sap-icon://work-history"
          }
        ]);
        this.setModel(oTaskTypesModel, "taskTypesModel");

        ApiHandlers.handleGetApiCall("https://task-manage-dissertation.herokuapp.com/users", {}).then((users) => {
          const oUserModel = new JSONModel(users);
          this.setModel(oUserModel, "userModel");
        }).catch((err) => {
          console.log(err);
        });

        this.setModel(new JSONModel([
          {
            "burndown": [
              {
                "username": "Vaibhav",
                "tasks": [
                  {
                    "tasktype": "Story",
                    "assignedno": "3"
                  },
                  {
                    "tasktype": "Bug",
                    "assignedno": "2"
                  },
                  {
                    "tasktype": "Task",
                    "assignedno": "2"
                  }
                ]
              },
              {
                "username": "Abhi",
                "tasks": [
                  {
                    "tasktype": "Story",
                    "assignedno": "5"
                  },
                  {
                    "tasktype": "Bug",
                    "assignedno": "3"
                  },
                  {
                    "tasktype": "Task",
                    "assignedno": "2"
                  }
                ]
              },
              {
                "username": "Ashok",
                "tasks": [
                  {
                    "tasktype": "Story",
                    "assignedno": "2"
                  },
                  {
                    "tasktype": "Bug",
                    "assignedno": "1"
                  },
                  {
                    "tasktype": "Task",
                    "assignedno": "1"
                  }
                ]
              },
              {
                "username": "Raviganesh M",
                "tasks": [
                  {
                    "tasktype": "Story",
                    "assignedno": "2"
                  },
                  {
                    "tasktype": "Bug",
                    "assignedno": "5"
                  },
                  {
                    "tasktype": "Task",
                    "assignedno": "1"
                  }
                ]
              }
            ]
          }
        ]), "reportModel");
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
