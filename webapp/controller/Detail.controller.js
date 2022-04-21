sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"com/ravi/dissertation/TaskManagementTool/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/ui/core/Fragment',
	'com/ravi/dissertation/TaskManagementTool/model/models',
	'com/ravi/dissertation/TaskManagementTool/model/formatter',
	'sap/m/MessageToast',
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
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

			this.byId("createTaskBtn").setEnabled(false); //initially disable create task button and enable after creating one project

			this.byId("exportBtn").setEnabled(false);

      const oModel = this.getOwnerComponent().getModel("masterTaskManagementModel");
      oModel.setData([
          {
            projectCode: "PROJ-123",
            taskTitle: "Task Title 1",
            taskType: "Bug",
            taskPriority: "Medium",
            taskAssigneeName: "Ravi",
            taskStatus: "Open"
          },
          {
            projectCode: "PROJ-456",
            taskTitle: "Task Title 2",
            taskType: "Backlog",
            taskPriority: "High",
            taskAssigneeName: "Ranjan",
            taskStatus: "In Progress"
          },
        {
          projectCode: "PROJ-456",
          taskTitle: "Task Title 2",
          taskType: "Backlog",
          taskPriority: "High",
          taskAssigneeName: "Ranjanii",
          taskStatus: "Blocked"
        },
        {
          projectCode: "PROJ-456",
          taskTitle: "Task Title 2",
          taskType: "Backlog",
          taskPriority: "High",
          taskAssigneeName: "Ranjan",
          taskStatus: "Completed"
        }
        ]
      )
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
		},

    handleIssuesListSearch: function(oEvent) {
      console.log("Search triggered");
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
					name: "com.vistex.taskmanagement.fragments.CreateIssue",
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
				this.oComponent.getModel("projectModel").setData(this._aProjects)
				this.oComponent.getModel("projectModel").refresh();
				this.byId("CreateProjectDialog").close();
				this.byId("createTaskBtn").setEnabled(true);
				MessageToast.show("New Project Created Successfully!!");
			} else {
				MessageToast.show("Please enter mandatory fields")
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
				oCreateTaskModel.setProperty("/tasks/taskTypeName", oTaskTypeInputItem.getText());
				oCreateTaskModel.setProperty("/tasks/taskAssigneeName", oCreateAssigneeInputItem.getText());
				oCreateTaskModel.setProperty("/tasks/taskPriorityName", oCreatePrioInputItem.getText());

				let oMasterTaskmgmtModel = this.oComponent.getModel("masterTaskManagementModel");

				this.aMasterData.push(oCreateTaskModel.getData()); //push the newly created issue into the masterTaskManagementModel model
				oMasterTaskmgmtModel.setData(this.aMasterData);
				oMasterTaskmgmtModel.refresh(); // refresh model

				//message toast after creation
				MessageToast.show(`New Task under project code - ${oCreateTaskModel.getProperty('/projectCode')} created successfully`);

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
				label: 'Issues',
				property: 'projectCode',
				type: EdmType.String
			});

			aCols.push({
				label: 'project Name',
				type: EdmType.String,
				property: 'projectName'
			});
			aCols.push({
				label: 'task title',
				type: EdmType.String,
				property: 'tasks/taskTitle'
			});
			aCols.push({
				label: 'task type',
				type: EdmType.String,
				property: 'tasks/taskTypeName'
			});
			aCols.push({
				label: 'task assignee',
				type: EdmType.String,
				property: 'tasks/taskAssigneeName'
			});
			aCols.push({
				label: 'task priority',
				type: EdmType.String,
				property: 'tasks/taskPriorityName'
			});

			aCols.push({
				label: 'task status',
				type: EdmType.String,
				property: 'tasks/taskStatus'
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
				this._oTable = this.byId('tasksTable');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: 'Table export sample.xlsx',
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function () {
				oSheet.destroy();
			});
		},
	});
});
