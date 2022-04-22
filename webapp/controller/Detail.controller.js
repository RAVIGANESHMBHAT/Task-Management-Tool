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

			//this.byId("createTaskBtn").setEnabled(false); //initially disable create task button and enable after creating one project

			//this.byId("exportBtn").setEnabled(false);

      const oModel = this.getOwnerComponent().getModel("masterTaskManagementModel");
      oModel.loadData("localService/mockdata/IssuesList.json")

      const oTaskPrio = [
        {
          "name": "Low",
          "taskPrioCode": 0,
          "icon":"sap-icon://arrow-bottom"
        },
        {
          "name": "Medium",
          "taskPrioCode": 1,
          "icon": "sap-icon://circle-task-2"
        },
        {
          "name": "High",
          "taskPrioCode": 2,
          "icon":"sap-icon://arrow-top"
        }
      ]
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
				oCreateTaskModel.setProperty("/taskType", oTaskTypeInputItem.getText());
				oCreateTaskModel.setProperty("/taskAssigneeName", oCreateAssigneeInputItem.getText());
				oCreateTaskModel.setProperty("/taskPriority", oCreatePrioInputItem.getText());

        oCreateTaskModel.setProperty("/taskTitle", oCreateTaskModel.getProperty("/tasks/taskTitle"))
        oCreateTaskModel.setProperty("/taskStatus", oCreateTaskModel.getProperty("/tasks/taskStatus"))

				let oMasterTaskmgmtModel = this.oComponent.getModel("masterTaskManagementModel");

				this.aMasterData.push(oCreateTaskModel.getData()); //push the newly created issue into the masterTaskManagementModel model
        let oldTasks = oMasterTaskmgmtModel.getData();
        oldTasks = oldTasks.concat(this.aMasterData)
				oMasterTaskmgmtModel.setData(oldTasks);
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
				label: 'Project Name',
				property: 'projectCode',
				type: EdmType.String
			});
			aCols.push({
				label: 'Task Title',
				type: EdmType.String,
				property: 'taskTitle'
			});
			aCols.push({
				label: 'Task Type',
				type: EdmType.String,
				property: 'taskType'
			});
			aCols.push({
				label: 'Task Assignee',
				type: EdmType.String,
				property: 'taskAssigneeName'
			});
			aCols.push({
				label: 'Task Priority',
				type: EdmType.String,
				property: 'taskPriority'
			});

			aCols.push({
				label: 'Task Status',
				type: EdmType.String,
				property: 'taskStatus'
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
