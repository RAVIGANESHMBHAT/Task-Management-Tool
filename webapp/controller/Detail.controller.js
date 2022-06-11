jQuery.sap.require("taskmanagementtool.controls.BurndownChart");

sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "taskmanagementtool/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "taskmanagementtool/model/models",
  "taskmanagementtool/model/formatter",
  "sap/m/MessageToast",
  "sap/ui/export/library",
  "sap/ui/export/Spreadsheet",
  "sap/m/SearchField",
  "taskmanagementtool/helpers/ApiHandlers",
  "sap/ui/core/BusyIndicator"
], function (JSONModel, BaseController, Filter, FilterOperator, Sorter, MessageBox, Fragment, models, formatter, MessageToast,
             exportLibrary, Spreadsheet, SearchField, ApiHandlers, BusyIndicator) {
  "use strict";

  var EdmType = exportLibrary.EdmType;
  return BaseController.extend("taskmanagementtool.controller.Detail", {

    formatter: formatter,

    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("detail").attachPatternMatched(this._onUserMatched, this);
      this.oComponent = this.getOwnerComponent();

      this.aMasterData = []; //master data array, later will be pushed to the model

      this._createIssueFragment = {}; //Initialize create issue fragment

      this._createProjectFragment = {}; //Initialize create project fragment

      this._createReportFragment = {}; //initialize report fragment

      //this.byId("createTaskBtn").setEnabled(false); //initially disable create task button and enable after creating one project

      //this.byId("exportBtn").setEnabled(false);

      const oTaskPriorities = [
        {
          "name": "Low",
          "taskPrioCode": 0,
          "icon": "sap-icon://arrow-bottom"
        },
        {
          "name": "Medium",
          "taskPrioCode": 1,
          "icon": "sap-icon://circle-task-2"
        },
        {
          "name": "High",
          "taskPrioCode": 2,
          "icon": "sap-icon://arrow-top"
        }
      ];
      const oTaskMgntModel = this.getOwnerComponent().getModel("taskManagement");
      oTaskMgntModel.setProperty("/TaskPriority", oTaskPriorities);

    },

    loadIssuesData: async function () {
      try {
        const issues = await ApiHandlers.getAllIssues();
        const oModel = this.getOwnerComponent().getModel("masterTaskManagementModel");
        oModel.setData(issues);
        this.getOwnerComponent().getModel("issuesFilterModel").setProperty("/issuesListCount", issues.length);
      } catch (err) {
        console.error(err);
      }
    },

    _onUserMatched: function (oEvent) {
      this._userName = oEvent.getParameter("arguments").userName || "User";
      const oFilterBar = this.byId("issuesListFilterBarId");
      var oSearchField = oFilterBar.getBasicSearch();

      let oBasicSearch;
      if (!oSearchField) {
        oBasicSearch = new SearchField({
          id: "issuesSearch",
          showSearchButton: true,
          liveChange: [this.handleIssuesListSearch, this]
        });
      } else {
        oSearchField = null;
      }
      if (oBasicSearch) {
        oFilterBar.setBasicSearch(oBasicSearch);
      }
      this.loadIssuesData();
      BusyIndicator.hide(1);
      this.loadProjectsData();
    },

    loadProjectsData: function () {
      const oProjectModel = this.getOwnerComponent().getModel("projectModel");
      ApiHandlers.handleGetApiCall("https://task-manage-dissertation.herokuapp.com/projects", {}).then((projects) => {
        oProjectModel.setData(projects);
      }).catch((err) => {
        console.log(err);
      });
    },

    handleIssuesListSearch: function (oEvent) {
      var oIssuesFilterModel = this.getModel("issuesFilterModel");
      const sSearchValue = oEvent ? oEvent.getSource().getProperty("value") : "";

      if (oIssuesFilterModel.getProperty("/filterBarData") === undefined) {
        const oFilterBarData = {};
        oFilterBarData["searchValue"] = sSearchValue;
        oIssuesFilterModel.setProperty("/filterBarData", oFilterBarData);
      } else {
        oIssuesFilterModel.setProperty("/filterBarData/searchValue", sSearchValue);
      }
      this.onFiltersSelectionChange(oEvent);
    },
    onProjectIdFiltersSelectionChange: function (oEvent) {
      oEvent.source = "Project_Id_ComboBox";
      this.onFiltersSelectionChange(oEvent);
    },

    onIssueTypeFiltersSelectionChange: function (oEvent) {
      oEvent.source = "Issue_Type_ComboBox";
      this.onFiltersSelectionChange(oEvent);
    },

    onPriorityFiltersSelectionChange: function (oEvent) {
      oEvent.source = "Priority_ComboBox";
      this.onFiltersSelectionChange(oEvent);
    },

    onStatusFiltersSelectionChange: function (oEvent) {
      oEvent.source = "Status_ComboBox";
      this.onFiltersSelectionChange(oEvent);
    },

    handleSelectionFinish: function (oEvent) {
      var aSelectedItems = oEvent ? oEvent.getParameter("selectedItems") : [];
      var aItems = [];
      for (var i = 0; i < aSelectedItems.length; i++) {
        aItems.push(aSelectedItems[i].getText());
      }
      return aItems;
    },

    onFiltersSelectionChange: function (oEvent) {
      const sSourceControl = oEvent.source;

      const oIssuesFilterModel = this.getModel("issuesFilterModel");
      var oFilterBarData;
      if (sSourceControl === "Project_Id_ComboBox") {
        let aSelectedProjectIds = this.handleSelectionFinish(oEvent);
        if (oIssuesFilterModel.getProperty("/filterBarData") === undefined) {
          oFilterBarData = {};
          oFilterBarData["projectIdFilters"] = aSelectedProjectIds;
          oIssuesFilterModel.setProperty("/filterBarData", oFilterBarData);
        } else {
          oIssuesFilterModel.setProperty("/filterBarData/projectIdFilters", aSelectedProjectIds);
        }
      } else if (sSourceControl === "Issue_Type_ComboBox") {
        let aSelectedIssueTypes = this.handleSelectionFinish(oEvent);
        if (oIssuesFilterModel.getProperty("/filterBarData") === undefined) {
          oFilterBarData = {};
          oFilterBarData["issueTypeFilters"] = aSelectedIssueTypes;
          oIssuesFilterModel.setProperty("/filterBarData", oFilterBarData);
        } else {
          oIssuesFilterModel.setProperty("/filterBarData/issueTypeFilters", aSelectedIssueTypes);
        }
      } else if (sSourceControl === "Priority_ComboBox") {
        let aSelectedPriorities = this.handleSelectionFinish(oEvent);
        if (oIssuesFilterModel.getProperty("/filterBarData") === undefined) {
          oFilterBarData = {};
          oFilterBarData["priorityFilters"] = aSelectedPriorities;
          oIssuesFilterModel.setProperty("/filterBarData", oFilterBarData);
        } else {
          oIssuesFilterModel.setProperty("/filterBarData/priorityFilters", aSelectedPriorities);
        }
      } else if (sSourceControl === "Status_ComboBox") {
        let aSelectedStatuses = this.handleSelectionFinish(oEvent);
        if (oIssuesFilterModel.getProperty("/filterBarData") === undefined) {
          oFilterBarData = {};
          oFilterBarData["statusFilters"] = aSelectedStatuses;
          oIssuesFilterModel.setProperty("/filterBarData", oFilterBarData);
        } else {
          oIssuesFilterModel.setProperty("/filterBarData/statusFilters", aSelectedStatuses);
        }
      }
      var oIssuesTable = this.byId("tasksTable"),
        oTableBinding = oIssuesTable.getBinding("items"),
        aFilterContent = this.constructFilters();

      oTableBinding.filter(new Filter({
        filters: aFilterContent,
        and: true
      }));
      oIssuesFilterModel.setProperty("/issuesListCount", oTableBinding.getLength());
      var oExportDataModel = this.getModel("tableExportModel");
      var aData = (oIssuesTable.getItems() || []).map(function (oItem) {
        return oItem.getBindingContext("masterTaskManagementModel").getObject();
      });
      oExportDataModel.setData(aData);
    },

    constructFilters: function () {
      let oIssuesFilterModel = this.getModel("issuesFilterModel"),
        sSearchValue = oIssuesFilterModel.getProperty("/filterBarData/searchValue"),
        aProjectIdFilters = oIssuesFilterModel.getProperty("/filterBarData/projectIdFilters"),
        aIssueTypeFilters = oIssuesFilterModel.getProperty("/filterBarData/issueTypeFilters"),
        aIssuePriorityFilters = oIssuesFilterModel.getProperty("/filterBarData/priorityFilters"),
        aIssueStatusFilters = oIssuesFilterModel.getProperty("/filterBarData/statusFilters"),
        aCombinedFilters = [];

      if (sSearchValue && sSearchValue !== "") {
        var oSearchFilter0 = new Filter("taskAssigneeName", FilterOperator.Contains, sSearchValue),
          oSearchFilter1 = new Filter("projectCode", FilterOperator.Contains, sSearchValue),
          oSearchFilter2 = new Filter("taskTitle", FilterOperator.Contains, sSearchValue),
          oAllSearchFilters = new Filter({
            filters: [oSearchFilter0, oSearchFilter1, oSearchFilter2],
            and: false
          });
        aCombinedFilters.push(oAllSearchFilters);
      }

      if (aProjectIdFilters && aProjectIdFilters.length > 0) {
        var aAllBatchFilters = [];
        for (var i = 0; i < aProjectIdFilters.length; i++) {
          aAllBatchFilters.push(new Filter("projectCode", FilterOperator.EQ, aProjectIdFilters[i]));
        }
        var oAllBatchFilters = new Filter({
          filters: aAllBatchFilters,
          and: false
        });
        aCombinedFilters.push(oAllBatchFilters);
      }

      if (aIssueTypeFilters && aIssueTypeFilters.length > 0) {
        var aAllBatchFilters = [];
        for (var i = 0; i < aIssueTypeFilters.length; i++) {
          aAllBatchFilters.push(new Filter("taskType", FilterOperator.EQ, aIssueTypeFilters[i]));
        }
        var oAllBatchFilters = new Filter({
          filters: aAllBatchFilters,
          and: false
        });
        aCombinedFilters.push(oAllBatchFilters);
      }

      if (aIssuePriorityFilters && aIssuePriorityFilters.length > 0) {
        var aAllBatchFilters = [];
        for (var i = 0; i < aIssuePriorityFilters.length; i++) {
          aAllBatchFilters.push(new Filter("taskPriority", FilterOperator.EQ, aIssuePriorityFilters[i]));
        }
        var oAllBatchFilters = new Filter({
          filters: aAllBatchFilters,
          and: false
        });
        aCombinedFilters.push(oAllBatchFilters);
      }

      if (aIssueStatusFilters && aIssueStatusFilters.length > 0) {
        var aAllStatusFilters = [];
        for (var i = 0; i < aIssueStatusFilters.length; i++) {
          aAllStatusFilters.push(new Filter("taskStatus", FilterOperator.EQ, aIssueStatusFilters[i]));
        }
        var oAllStatusFilters = new Filter({
          filters: aAllStatusFilters,
          and: false
        });
        aCombinedFilters.push(oAllStatusFilters);
      }
      return aCombinedFilters;
    },

    clearFilters: function () {
      var oFilterBar = this.byId("issuesListFilterBarId"),
        oFilterItems = oFilterBar.getAllFilterItems(true),
        oIssuesTable = this.byId("tasksTable"),
        oTableBinding = oIssuesTable.getBinding("items");
      oTableBinding.filter(new Filter({
        filters: [],
        and: true
      }));
      const oIssuesFilterModel = this.getModel("issuesFilterModel");
      oIssuesFilterModel.setProperty("/issuesListCount", oIssuesTable.getBinding("items").getLength());
      var oExportDataModel = this.getModel("tableExportModel");
      var aData = (oIssuesTable.getItems() || []).map(function (oItem) {
        return oItem.getBindingContext("masterTaskManagementModel").getObject();
      });
      oExportDataModel.setData(aData);
      for (var i = 0; i < oFilterItems.length; i++) {
        var oControl = oFilterBar.determineControlByFilterItem(oFilterItems[i]);
        if (oControl) {
          oControl.setSelectedKeys(null);
        }
      }
      oIssuesFilterModel.setProperty("/filterBarData/searchValue", "");
      oIssuesFilterModel.setProperty("/filterBarData/projectIdFilters", []);
      oIssuesFilterModel.setProperty("/filterBarData/issueTypeFilters", []);
      oIssuesFilterModel.setProperty("/filterBarData/priorityFilters", []);
      oIssuesFilterModel.setProperty("/filterBarData/statusFilters", []);
      oFilterBar.getContent()[0].getContent()[1].setValue("");
    },

    onListItemPress: function (oEvent) {
      BusyIndicator.show(1);
      //get the context path
      var taskPath = oEvent.getSource().getBindingContext("masterTaskManagementModel").getPath();

      const oMasterModel = this.getOwnerComponent().getModel("masterTaskManagementModel");
      const oSelectedRowData = oMasterModel.getProperty(taskPath);

      // route to the detaildetail page for showing the information
      this.oRouter.navTo("detailDetail", {
        layout: sap.f.LayoutType.TwoColumnsMidExpanded,
        userName: this._userName,
        task: oSelectedRowData._id

      }, false);
    },

    onSearch: function (oEvent) {
      var oTableSearchState = [],
        sQuery = oEvent.getParameter("query");

      if (sQuery && sQuery.length > 0) {
        oTableSearchState = [
          new Filter("projectCode", FilterOperator.Contains, sQuery) //enabled search on project code and create Filter constructor
        ];
      }

      this.getView().byId("tasksTable").getBinding("items").filter(oTableSearchState, "Application"); //filter on project code
    },

    onCreateIssue: function () {
      var oView = this.getView();

      //create a new model to fetch the data from dialog
      this.oComponent.setModel(models.createTaskModel(), "createTaskModel");

      // create dialog lazily
      if (!this.createIssueDialog) {
        this.createIssueDialog = Fragment.load({
          id: oView.getId(),
          name: "taskmanagementtool.fragments.CreateIssue",
          controller: this //bind controller to fragment for eventing
        }).then(function (oDialog) {
          // connect dialog to the root view of this component (models, lifecycle)
          oView.addDependent(oDialog);
          return oDialog;
        });
      }
      this.createIssueDialog.then(function (oDialog) {
        oDialog.open(); //open dialog
      });
    },

    onPressNewProjectButton: function () {
      var oView = this.getView();
      //create a new model to fetch the data from dialog
      this.getOwnerComponent().setModel(models.createProjectModel(), "createProjectModel");
      // create dialog lazily
      if (!this.createProjectDialog) {
        this.createProjectDialog = Fragment.load({
          id: oView.getId(),
          name: "taskmanagementtool.fragments.CreateProject",
          controller: this
        }).then(function (oDialog) {
          // connect dialog to the root view of this component (models, lifecycle)
          oView.addDependent(oDialog);
          return oDialog;
        });
        this._aProjects = []; //initialize projects array and later push it to a model
      }
      this.createProjectDialog.then(function (oDialog) {
        oDialog.open();
      });
    },

    onCloseCreateTaskDialog: function () {
      // note: We don't need to chain to the pDialog promise, since this event-handler
      // is only called from within the loaded dialog itself.
      this.byId("CreateDialog").close();
    },

    onCloseCreateProjectDialog: function () {
      // note: We don't need to chain to the pDialog promise, since this event-handler
      // is only called from within the loaded dialog itself.
      this.byId("CreateProjectDialog").close();
    },

    onProjectSave: function () {
      let createProjectModelData = this.oComponent.getModel("createProjectModel").getData();
      if (createProjectModelData.projectCode.trim() !== "" && createProjectModelData.projectName.trim() !== "") {

        const payload = {
          projectCode: createProjectModelData.projectCode,
          projectName: createProjectModelData.projectName
        };
        ApiHandlers.createProject(payload).then(() => {
          MessageToast.show("Project created successfully.");
          this.byId("CreateProjectDialog").close();
          this.loadProjectsData();
        }).catch((err) => {
          MessageToast.show(err.statusText);
        });
        this.byId("createTaskBtn").setEnabled(true);
      } else {
        MessageToast.show("Please enter mandatory fields");
      }

    },

    onProjectComboboxSelectionChange: function (oEvent) {
      const selectedProject = oEvent.getSource().getSelectedItem().getAdditionalText();
      this.projectNameToGenerateReport = selectedProject;
    },

    onPressShowReportButton: function () {
      const oThis = this;
      if (!oThis._oProjectDialog) {
        sap.ui.core.Fragment.load({
          id: oThis.getView().getId(),
          name: "taskmanagementtool.fragments.SelectProject",
          controller: oThis
        }).then(function (oDialog) {
          oThis._oProjectDialog = oDialog;
          oThis.getView().addDependent(oThis._oProjectDialog);
          oThis._oProjectDialog.open();
        }.bind(oThis));
      } else {
        oThis.getView().addDependent(oThis._oProjectDialog);
        oThis._oProjectDialog.open();
      }
    },

    onPrintReportDialog: function () {
      const id = this.getView().getId() + "--customControlReportDialog-scrollCont";
      if (id) {
        const ctrlString = "width=800px,height=800px";
        var newWindow = window.open("", "PrintWindow", ctrlString);
        var printContents = document.getElementById(id).outerHTML;
        newWindow.document.write("<div><h5>Project Name: " + this.projectNameToGenerateReport + "</h5><h5> Date: " + new Date() + "</div>" + printContents);
        newWindow.print();
        newWindow.close();
        this._taskReportDialog.close();
        this._oProjectDialog.close();
      }
    },

    oncloseReportDialog: function () {
      this._taskReportDialog.close();
    },

    handleGenerateProjectReport: function () {
      const oThis = this;
      if (!this._taskReportDialog) {
        this.createTaskReportDialog = Fragment.load({
          id: this.getView().getId(),
          name: "taskmanagementtool.fragments.ProjectReport",
          controller: this //bind controller to fragment for eventing
        }).then(function (oDialog) {
          // connect dialog to the root view of this component (models, lifecycle)
          oThis._taskReportDialog = oDialog;
          oThis.getView().addDependent(oDialog);
          return oDialog;
        });
      }
      this.createTaskReportDialog.then((oDialog) => {
        oThis.addCustomControl();
        oDialog.open(); //open dialog

      });
    },

    addCustomControl: function () {
      let oBurndowncontainer = this.getView().byId("burndownchartcontainer");

      oBurndowncontainer.removeAllItems(); // remove previous content
      let oBurndownItem = new taskmanagementtool.BurndownChartItem({
        username: "{username}",
        tasks: "{tasks}"
      });
      /* new  chart */
      let oBurndownReport = new taskmanagementtool.BurndownChart({
        items: {
          path: "/0/burndown",
          template: oBurndownItem
        }
      });

      let oModel = this.getOwnerComponent().getModel("reportModel");
      oBurndownReport.setModel(oModel);
      oBurndowncontainer.addItem(oBurndownReport);
    },

    handleSelectProjectDialogClose: function () {
      this._oProjectDialog.close();
    },

    onSaveTask: function () {
      let oView = this.getView();
      let oCreateTaskModel = this.oComponent.getModel("createTaskModel");

      let oProjectInputItem = oView.byId("create-project").getSelectedItem();
      let oTaskTypeInputItem = oView.byId("create-taskType").getSelectedItem();
      let oCreateAssigneeInputItem = oView.byId("create-assignee").getSelectedItem();
      let oCreatePrioInputItem = oView.byId("create-priority").getSelectedItem();
      let oDescription = oView.byId("descriptionRichTextEditorId");

      if (oProjectInputItem && oTaskTypeInputItem && oCreateAssigneeInputItem && oCreatePrioInputItem && oCreateTaskModel.getProperty("/tasks/taskTitle").trim() !== ""
        && oCreateTaskModel.getProperty("/tasks/originalEstimate").trim() !== "" && oCreateTaskModel.getProperty("/tasks/taskStatus").trim() !== "") {
        oCreateTaskModel.setProperty("/projectCode", oProjectInputItem.getText());
        oCreateTaskModel.setProperty("/projectName", oProjectInputItem.getText());
        oCreateTaskModel.setProperty("/taskType", oTaskTypeInputItem.getText());
        oCreateTaskModel.setProperty("/taskAssigneeName", oCreateAssigneeInputItem.getText());
        oCreateTaskModel.setProperty("/taskAssigneeId", oCreateAssigneeInputItem.getKey());
        oCreateTaskModel.setProperty("/taskPriority", oCreatePrioInputItem.getText());

        oCreateTaskModel.setProperty("/taskTitle", oCreateTaskModel.getProperty("/tasks/taskTitle"));
        oCreateTaskModel.setProperty("/taskDescription", oDescription.getValue().substr(3, oDescription.getValue().length - 7));
        oCreateTaskModel.setProperty("/taskStatus", oCreateTaskModel.getProperty("/tasks/taskStatus"));

        const payload = {
          "projectCode": oProjectInputItem.getText(),
          "taskType": oTaskTypeInputItem.getText(),
          "taskTitle": oCreateTaskModel.getProperty("/tasks/taskTitle"),
          "taskDescription": oDescription.getValue(),
          "originalEstimation": oCreateTaskModel.getProperty("/tasks/originalEstimate"),
          "taskPriority": oCreatePrioInputItem.getText(),
          "taskAssigneeName": oCreateAssigneeInputItem.getText(),
          "taskAssigneeId": oCreateAssigneeInputItem.getKey(),
          "taskStatus": oCreateTaskModel.getProperty("/tasks/taskStatus")
        };

        ApiHandlers.handlePostApiCall("https://task-manage-dissertation.herokuapp.com/issues", payload).then((data) => {
          this.byId("CreateDialog").close();
          this.loadIssuesData();
          MessageToast.show(`New ${oTaskTypeInputItem.getText()} under project code - ${oCreateTaskModel.getProperty("/projectCode")} created successfully`);
          this.byId("exportBtn").setEnabled(true);
        }).catch((err) => {
          MessageBox.information(`${oTaskTypeInputItem.getText()} creation failed.`);
        });

      } else {
        MessageBox.show("Please select all the mandatory(*) fields in the dialog");
      }

    },

    createColumnConfig: function () {
      var aCols = [];

      aCols.push({
        label: "Project Name",
        property: "projectCode",
        type: EdmType.String
      });
      aCols.push({
        label: "Task Title",
        type: EdmType.String,
        property: "taskTitle"
      });
      aCols.push({
        label: "Task Type",
        type: EdmType.String,
        property: "taskType"
      });
      aCols.push({
        label: "Task Assignee",
        type: EdmType.String,
        property: "taskAssigneeName"
      });
      aCols.push({
        label: "Task Priority",
        type: EdmType.String,
        property: "taskPriority"
      });

      aCols.push({
        label: "Task Status",
        type: EdmType.String,
        property: "taskStatus"
      });

      return aCols;
    },

    onExport: function () {
      var aCols, oRowBinding, oSettings, oSheet, oTable;

      if (!this._oTable) {
        this._oTable = this.byId("tasksTable");
      }

      oTable = this._oTable;
      oRowBinding = oTable.getBinding("items");
      aCols = this.createColumnConfig();

      oSettings = {
        workbook: {
          columns: aCols,
          hierarchyLevel: "Level"
        },
        dataSource: this.getModel("tableExportModel").getData(),
        fileName: "Issues Table Data.xlsx",
        worker: false // We need to disable worker because we are using a MockServer as OData Service
      };

      oSheet = new Spreadsheet(oSettings);
      oSheet.build().finally(function () {
        oSheet.destroy();
      });
    },
  });
});
