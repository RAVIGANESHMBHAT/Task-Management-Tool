sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "com/ravi/dissertation/TaskManagementTool/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment",
  "com/ravi/dissertation/TaskManagementTool/model/models",
  "com/ravi/dissertation/TaskManagementTool/model/formatter",
  "sap/m/MessageToast",
  "sap/ui/export/library",
  "sap/ui/export/Spreadsheet",
  "sap/m/SearchField",
], function (JSONModel, BaseController, Filter, FilterOperator, Sorter, MessageBox, Fragment, models, formatter, MessageToast,
             exportLibrary, Spreadsheet, SearchField) {
  "use strict";

  var EdmType = exportLibrary.EdmType;
  return BaseController.extend("com.ravi.dissertation.TaskManagementTool.controller.Detail", {

    formatter: formatter,

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     *
     */
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

      const oModel = this.getOwnerComponent().getModel("masterTaskManagementModel");
      oModel.loadData("localService/mockdata/IssuesList.json");

      const oTaskPrio = [
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
      oTaskMgntModel.setProperty("/TaskPriority", oTaskPrio);
    },

    /**
     * Method called everytime the route is matched
     * @public
     */
    _onUserMatched: function (oEvent) {
      this._userName = oEvent.getParameter("arguments").userName || "User"; //test purpose setting it to User
      //	this.getView().byId("greetUserId").setText(`Welcome: ${this._userName}`); //ES6 template literal backtick
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
      sap.ui.core.BusyIndicator.hide(1);
      this.getModel("issuesFilterModel").setProperty("/issuesListCount", 4);
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
      //oIssuesFilterModel.setProperty("/eventWiseScholarsListCount", oTableBinding.getLength());
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
      var oMasterModel = this.getModel("masterTaskManagementModel");
      this.getModel("issuesFilterModel").setProperty("/issuesListCount", oIssuesTable.getBinding("items").getLength());
      var oExportDataModel = this.getModel("tableExportModel");
      var aData = (oIssuesTable.getItems() || []).map(function (oItem) {
        return oItem.getBindingContext("masterTaskManagementModel").getObject();
      });
      oExportDataModel.setData(aData);
      for (var i = 0; i < oFilterItems.length; i++) {
        var oControl = oFilterBar.determineControlByFilterItem(oFilterItems[i]);
        if (oControl) {
          oControl.setSelectedKeys("");
        }
      }
      oMasterModel.setProperty("/filterBarData/searchValue", "");
      oMasterModel.setProperty("/filterBarData/batchFilters", []);
      oMasterModel.setProperty("/filterBarData/currentRoundFilters", []);
      oMasterModel.setProperty("/filterBarData/statusFilters", []);
      oFilterBar.getContent()[0].getContent()[1].setValue("");
    },

    /**
     * Method called when a list item is clicked
     * @public
     * @param {oEvent} - Event data
     */
    onListItemPress: function (oEvent) {
      //get the context path
      var taskPath = oEvent.getSource().getBindingContext("masterTaskManagementModel").getPath(),
        task = taskPath.split("/").slice(-1).pop();

      // route to the detaildetail page for showing the information
      this.oRouter.navTo("detailDetail", {
        layout: sap.f.LayoutType.TwoColumnsMidExpanded,
        userName: this._userName,
        task: task

      });
    },

    /**
     * Method called on search event
     * @public
     * @param {oEvent} - Event data
     */
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

    /**
     * Method to open create issue dialog
     * @public
     */
    onCreateIssue: function () {
      var oView = this.getView();

      //create a new model to fetch the data from dialog
      this.oComponent.setModel(models.createTaskModel(), "createTaskModel");

      // create dialog lazily
      if (!this.createIssueDialog) {
        this.createIssueDialog = Fragment.load({
          id: oView.getId(),
          name: "com.ravi.dissertation.TaskManagementTool.fragments.CreateIssue",
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

    /**
     * Method to open project dialog
     * @public
     */
    onPressNewProjectButton: function () {
      var oView = this.getView();
      //create a new model to fetch the data from dialog
      this.oComponent.setModel(models.createProjectModel(), "createProjectModel");
      // create dialog lazily
      if (!this.createProjectDialog) {
        this.createProjectDialog = Fragment.load({
          id: oView.getId(),
          name: "com.ravi.dissertation.TaskManagementTool.fragments.CreateProject",
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

    /**
     * Method to close create issue dialog
     * @public
     */
    onCloseCreateTaskDialog: function () {
      // note: We don't need to chain to the pDialog promise, since this event-handler
      // is only called from within the loaded dialog itself.
      this.byId("CreateDialog").close();
    },

    /**
     * Method to close create project dialog
     * @public
     */
    onCloseCreateProjectDialog: function () {
      // note: We don't need to chain to the pDialog promise, since this event-handler
      // is only called from within the loaded dialog itself.
      this.byId("CreateProjectDialog").close();
    },

    /**
     * Method called on save project dialog
     * @public
     */
    onProjectSave: function () {
      let createProjectModelData = this.oComponent.getModel("createProjectModel").getData();
      if (createProjectModelData.projectCode.trim() !== "" && createProjectModelData.projectName.trim() !== "") {
        this._aProjects.push(createProjectModelData);
        let oldProjects = this.oComponent.getModel("projectModel").getData();
        oldProjects = oldProjects.concat(this._aProjects);
        this.oComponent.getModel("projectModel").setData(oldProjects); //this._aProjects
        this.oComponent.getModel("projectModel").refresh();
        this.byId("CreateProjectDialog").close();
        this.byId("createTaskBtn").setEnabled(true);
        MessageToast.show("New Project Created Successfully!!");
      } else {
        MessageToast.show("Please enter mandatory fields");
      }

    },

    /**
     * Method called on save issue dialog
     * @public
     */
    onSaveTask: function () {
      let oView = this.getView();
      let oCreateTaskModel = this.oComponent.getModel("createTaskModel");
      //since model saves the keys directly from the select control, need name data of these keys.

      let oProjectInputItem = oView.byId("create-project").getSelectedItem();
      let oTaskTypeInputItem = oView.byId("create-taskType").getSelectedItem();
      let oCreateAssigneeInputItem = oView.byId("create-assignee").getSelectedItem();
      let oCreatePrioInputItem = oView.byId("create-priority").getSelectedItem();

      if (oProjectInputItem && oTaskTypeInputItem && oCreateAssigneeInputItem && oCreatePrioInputItem) {
        //Note: Validation using message manager is pending...
        oCreateTaskModel.setProperty("/projectCode", oProjectInputItem.getText());
        oCreateTaskModel.setProperty("/projectName", oProjectInputItem.getText());
        oCreateTaskModel.setProperty("/taskType", oTaskTypeInputItem.getText());
        oCreateTaskModel.setProperty("/taskAssigneeName", oCreateAssigneeInputItem.getText());
        oCreateTaskModel.setProperty("/taskPriority", oCreatePrioInputItem.getText());

        oCreateTaskModel.setProperty("/taskTitle", oCreateTaskModel.getProperty("/tasks/taskTitle"));
        oCreateTaskModel.setProperty("/taskStatus", oCreateTaskModel.getProperty("/tasks/taskStatus"));

        let oMasterTaskmgmtModel = this.oComponent.getModel("masterTaskManagementModel");

        this.aMasterData.push(oCreateTaskModel.getData()); //push the newly created issue into the masterTaskManagementModel model
        let oldTasks = oMasterTaskmgmtModel.getData();
        oldTasks = oldTasks.concat(this.aMasterData);
        oMasterTaskmgmtModel.setData(oldTasks);
        oMasterTaskmgmtModel.refresh(); // refresh model
        this.getModel("issuesFilterModel").setProperty("/issuesListCount", oldTasks.length);
        this.aMasterData = [];

        //message toast after creation
        MessageToast.show(`New Task under project code - ${oCreateTaskModel.getProperty("/projectCode")} created successfully`);

        this.byId("exportBtn").setEnabled(true);
        //end- close dialog
        this.byId("CreateDialog").close();
      } else {
        MessageBox.show("Please select all the mandatory(*) fields in the dialog");
      }

    },

    /**
     * method called from onExport to get the columns to be dowloaded
     **/
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

    /**
     * on Export button click
     * downloads excel for configure column
     **/
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
