sap.ui.define([
  "jquery.sap.global",
  "sap/base/util/deepExtend",
  "sap/ui/core/syncStyleClass",
  "sap/ui/model/json/JSONModel",
  "taskmanagementtool/controller/BaseController",
  "sap/ui/core/Fragment",
  "taskmanagementtool/model/formatter",
  "sap/m/MessageBox",
  "sap/m/ObjectMarker",
  "sap/m/MessageToast",
  "sap/m/UploadCollectionParameter",
  "sap/m/library",
  "sap/ui/core/format/FileSizeFormat",
  "taskmanagementtool/helpers/ApiHandlers",
  "sap/ui/core/BusyIndicator"
], function (jQuery, deepExtend, syncStyleClass, JSONModel, BaseController, Fragment, formatter, MessageBox, ObjectMarker,
             MessageToast, UploadCollectionParameter, MobileLibrary, FileSizeFormat, ApiHandlers, BusyIndicator) {
  "use strict";

  var ListMode = MobileLibrary.ListMode,
    ListSeparators = MobileLibrary.ListSeparators;

  const URLHelper = MobileLibrary.URLHelper;

  return BaseController.extend("taskmanagementtool.controller.DetailDetail", {
    formatter: formatter,

    onInit: function () {
      //detaildetail page header buttons
      var oExitButton = this.getView().byId("exitFullScreenBtn"),
        oEnterButton = this.getView().byId("enterFullScreenBtn");

      this.oRouter = this.getOwnerComponent().getRouter();
      this.oModel = this.getOwnerComponent().getModel("layoutModel");
      this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onTaskMatched, this);

      //set focus, add event delegate
      [oExitButton, oEnterButton].forEach(function (oButton) {
        oButton.addEventDelegate({
          onAfterRendering: function () {
            if (this.bFocusFullScreenButton) {
              this.bFocusFullScreenButton = false;
              oButton.focus();
            }
          }.bind(this)
        });
      }, this);

      //initial form fragments
      this._formFragments = {};

      this.getView().setModel(new JSONModel({
        "maximumFilenameLength": 55,
        "maximumFileSize": 1000,
        "mode": ListMode.SingleSelectMaster,
        "uploadEnabled": true,
        "uploadButtonVisible": true,
        "enableEdit": true,
        "enableDelete": true,
        "visibleEdit": true,
        "visibleDelete": true,
        "listSeparatorItems": [
          ListSeparators.All,
          ListSeparators.None
        ],
        "showSeparators": ListSeparators.All,
        "listModeItems": [
          {
            "key": ListMode.SingleSelectMaster,
            "text": "Single"
          }, {
            "key": ListMode.MultiSelect,
            "text": "Multi"
          }
        ]
      }), "settings");

      this.getView().setModel(new JSONModel({
        "items": ["jpg", "txt", "ppt", "doc", "xls", "pdf", "png"],
        "selected": ["jpg", "txt", "ppt", "doc", "xls", "pdf", "png"]
      }), "fileTypes");

    },

    _onTaskMatched: function (oEvent) {
      this._task = oEvent.getParameter("arguments").task || "0";
      this._userName = oEvent.getParameter("arguments").userName;

      //Set the initial form to be the display one
      this._showFormFragment("DisplayTaskDetail");

      const issueId = oEvent.getParameter("arguments").task;

      this.setIssuesData(issueId);
      this.loadIssueComments(issueId);
      this.getView().setModel(new JSONModel(), "uploadFileModel");

    },

    setIssuesData: function (issueId) {
      ApiHandlers.handleGetApiCall(`https://task-manage-dissertation.herokuapp.com/issues/${issueId}`, {}).then((res) => {
        this.getModel("detailTaskManagementModel").setData(res);
        BusyIndicator.hide(1);
      }).catch((err) => {
        BusyIndicator.hide(1);
        MessageToast.show(err);
      });
    },

    loadIssueComments: function (issueId) {
      const oDisplayModel = this.getModel("detailTaskManagementModel");
      ApiHandlers.handleGetApiCall(`https://task-manage-dissertation.herokuapp.com/comments/${issueId}`).then((comments) => {
        comments.forEach((comment) => {
          if (comment.from === this._userName) {
            comment.from = "You";
          }
        });
        oDisplayModel.setProperty("/taskComments", comments);
      }).catch((err) => {
        MessageToast.show("Error fetching comments!");
      });

    },

    handleDeletePress: function () {
      MessageBox.warning(
        "You are about to delete this task, Are you sure?", {
          title: "Warning",
          actions: [
            "Delete",
            sap.m.MessageBox.Action.CANCEL
          ],
          emphasizedAction: "Delete",
          onClose: (oEvent) => {
            if (oEvent === "Delete") {
              ApiHandlers.handleDeleteApiCall(`https://task-manage-dissertation.herokuapp.com/issues/${this._task}`, {}).then(() => {
                MessageToast.show("Task deleted successfully.");
              }).catch((err) => {
                MessageBox.error(err);
              });

              const sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
              this.navigateToView(sNextLayout, "detail");
            }
          }
        }
      );
    },

    handleEditPress: function () {

      //Clone the data
      //	this._otask = Object.assign({}, this.getView().getModel("masterTaskManagementModel").getData()[Number(this._task)]);//shallow copy
      //this._otask = $.extend(true, {}, this.getView().getModel("masterTaskManagementModel").getData()[Number(this._task)]); //deep copy object if in case canceled the task in between

      const data = {...this.getOwnerComponent().getModel("detailTaskManagementModel").getData()};
      this.getOwnerComponent().setModel(new JSONModel(data), "editTaskManagementModel");

      this.toggleButtonsAndView(true); //utility function for toggling between fragments

    },

    toggleButtonsAndView: function (bEdit) {
      var oObjectPage = this.getView().byId("ObjectPageLayout"),
        bCurrentShowFooterState = oObjectPage.getShowFooter();

      oObjectPage.setShowFooter(!bCurrentShowFooterState);

      var oView = this.getView();

      // Show the appropriate action buttons
      oView.byId("otbFooter").setVisible(bEdit);
      oView.byId("editBtn").setVisible(!bEdit);
      oView.byId("deleteBtn").setVisible(!bEdit);
      oView.byId("closeButton").setVisible(!bEdit);
      // Set the right form type

      this.getView().getModel("masterTaskManagementModel").refresh();
      this._showFormFragment(bEdit ? "ChangeTaskDetail" : "DisplayTaskDetail");
      // oObjectPage.setSelectedSection(this.getView().byId("GeneralInfo").getId())
    },

    sendTaskDetailedMail: function () {
      const oDetailModel = this.getOwnerComponent().getModel("detailTaskManagementModel");
      const issueTitle = oDetailModel.getProperty("/taskTitle");
      const assigneeName = oDetailModel.getProperty("/taskAssigneeName");
      const issueType = oDetailModel.getProperty("/taskType");
      const issuePriority = oDetailModel.getProperty("/taskPriority");
      const issueStatus = oDetailModel.getProperty("/taskStatus");
      const issueDescription = oDetailModel.getProperty("/taskDescription");
      const originalEstimation = oDetailModel.getProperty("/originalEstimation");
      const mailSubject = `Task Management Tool: Info on the ${issueType}, "${issueTitle}"`;
      const mailBody = `Hello, Find the below details on the ${issueType}, "${issueTitle}".\n
                Issue Description: ${issueDescription}\n
                Assignee Name: ${assigneeName}\n
                Issue Priority: ${issuePriority}\n
                Issue Status: ${issueStatus}\n
                Original Estimation: ${originalEstimation}\n
                Find more on the ticket here, ${location.href}\n\n
                Regards,\n Task Management Tool Team.`;
      URLHelper.triggerEmail("", mailSubject, mailBody, false, false, true);
    },

    createObjectMarker: function (sId, oContext) {
      var mSettings = null;

      if (oContext.getProperty("type")) {
        mSettings = {
          type: "{type}",
          press: this.onMarkerPress
        };
      }
      return new ObjectMarker(sId, mSettings);
    },

    formatAttribute: function (sValue) {
      if (jQuery.isNumeric(sValue)) {
        return FileSizeFormat.getInstance({
          binaryFilesize: false,
          maxFractionDigits: 1,
          maxIntegerDigits: 3
        }).format(sValue);
      } else {
        return sValue;
      }
    },

    onChange: function (oEvent) {
      var oUploadCollection = oEvent.getSource();
      // Header Token
      var oCustomerHeaderToken = new UploadCollectionParameter({
        name: "x-csrf-token",
        value: "securityTokenFromModel"
      });
      oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
    },

    onFileDeleted: function (oEvent) {
      this.deleteItemById(oEvent.getParameter("documentId"));
      MessageToast.show("File deleted successfully.");
    },

    deleteItemById: function (sItemToDeleteId) {
      var oData = this.getView().getModel("uploadFileModel").getData();
      var aItems = deepExtend({}, oData).items;
      jQuery.each(aItems, function (index) {
        if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
          aItems.splice(index, 1);
        }
      });
      this.getView().getModel("uploadFileModel").setData({
        "items": aItems
      });
      this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
    },

    deleteMultipleItems: function (aItemsToDelete) {
      var oData = this.getView().getModel("uploadFileModel").getData();
      var nItemsToDelete = aItemsToDelete.length;
      var aItems = deepExtend({}, oData).items;
      var i = 0;
      jQuery.each(aItems, function (index) {
        if (aItems[index]) {
          for (i = 0; i < nItemsToDelete; i++) {
            if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()) {
              aItems.splice(index, 1);
            }
          }
        }
      });
      this.getView().getModel("uploadFileModel").setData({
        "items": aItems
      });
      this.getView().byId("attachmentTitle").setText(this.getAttachmentTitleText());
    },

    onFilenameLengthExceed: function () {
      MessageBox.error("Filename Length Exceed.");
    },

    onFileSizeExceed: function () {
      MessageBox.error("File Size Exceed.");
    },

    onTypeMissmatch: function () {
      MessageBox.error("File type missmatch.");
    },

    onFileRenamed: function (oEvent) {
      var oData = this.getView().getModel("uploadFileModel").getData();
      var aItems = deepExtend({}, oData).items;
      var sDocumentId = oEvent.getParameter("documentId");
      jQuery.each(aItems, function (index) {
        if (aItems[index] && aItems[index].documentId === sDocumentId) {
          aItems[index].fileName = oEvent.getParameter("item").getFileName();
        }
      });
      this.getView().getModel("uploadFileModel").setData({
        "items": aItems
      });
      MessageToast.show("File renamed successfully.");
    },

    onUploadComplete: function (oEvent) {
      var oData = this.getView().getModel("uploadFileModel").getData();

      if (!oData.items) oData.items = [];
      oData.items.unshift({
        "documentId": Date.now().toString(), // generate Id,
        "fileName": oEvent.getParameter("files")[0].fileName,
        "mimeType": "",
        "thumbnailUrl": "",
        "url": "",
        "attributes": [
          {
            "title": "Uploaded By",
            "text": "You",
            "active": false
          },
          {
            "title": "Uploaded On",
            "text": new Date().toLocaleDateString(),
            "active": false
          },
          {
            "title": "File Size",
            "text": "505000",
            "active": false
          }
        ],
        "statuses": [
          {
            "title": "",
            "text": "",
            "state": "None"
          }
        ],
        "markers": [
          {}
        ],
        "selected": false
      });

      this.getView().getModel("uploadFileModel").refresh();

      // Sets the text to the label
      this.byId("attachmentTitle").setText(this.getAttachmentTitleText());

      // delay the success message for to notice onChange message
      setTimeout(function () {
        MessageToast.show("Upload sccessful.");
      }, 4000);
    },

    onBeforeUploadStarts: function (oEvent) {
      // Header Slug
      var oCustomerHeaderSlug = new UploadCollectionParameter({
        name: "slug",
        value: oEvent.getParameter("fileName")
      });
      oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
      //MessageToast.show("BeforeUploadStarts event triggered.");
    },

    onFileTypeChange: function (oEvent) {
      this.getView().byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
    },

    onSelectAllPress: function (oEvent) {
      var oUploadCollection = this.byId("UploadCollection");
      if (!oEvent.getSource().getPressed()) {
        this.deselectAllItems(oUploadCollection);
        oEvent.getSource().setPressed(false);
        oEvent.getSource().setText("Select all");
      } else {
        this.deselectAllItems(oUploadCollection);
        oUploadCollection.selectAll();
        oEvent.getSource().setPressed(true);
        oEvent.getSource().setText("Deselect all");
      }
      this.onSelectionChange(oEvent);
    },

    onDeleteSelectedItems: function () {
      var aSelectedItems = this.byId("UploadCollection").getSelectedItems();
      this.deleteMultipleItems(aSelectedItems);
      if (this.byId("UploadCollection").getSelectedItems().length < 1) {
        this.byId("selectAllButton").setPressed(false);
        this.byId("selectAllButton").setText("Select all");
      }
      MessageToast.show("Item deleted successfully.");
    },

    deselectAllItems: function (oUploadCollection) {
      var aItems = oUploadCollection.getItems();
      for (var i = 0; i < aItems.length; i++) {
        oUploadCollection.setSelectedItem(aItems[i], false);
      }
    },

    getAttachmentTitleText: function () {
      var aItems = this.getView().byId("UploadCollection").getItems();
      return "Uploaded (" + aItems.length + ")";
    },

    onSelectionChange: function () {
      var oUploadCollection = this.byId("UploadCollection");
      // Only it is enabled if there is a selected item in multi-selection mode
      if (oUploadCollection.getMode() === ListMode.MultiSelect) {
        if (oUploadCollection.getSelectedItems().length > 0) {
          this.byId("deleteSelectedButton").setEnabled(true);
        } else {
          this.byId("deleteSelectedButton").setEnabled(false);
        }
      }
    },

    onAttributePress: function (oEvent) {
      MessageToast.show("Attribute press - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
    },

    onMarkerPress: function (oEvent) {
      MessageToast.show("Marker press - " + oEvent.getSource().getType());
    },

    onOpenAppSettings: function (oEvent) {
      var oView = this.getView();

      if (!this._pSettingsDialog) {
        this._pSettingsDialog = Fragment.load({
          id: oView.getId(),
          name: "sap.m.sample.UploadCollection.AppSettings",
          controller: this
        }).then(function (oSettingsDialog) {
          oView.addDependent(oSettingsDialog);
          return oSettingsDialog;
        });
      }

      this._pSettingsDialog.then(function (oSettingsDialog) {
        syncStyleClass("sapUiSizeCompact", oView, oSettingsDialog);
        oSettingsDialog.setContentWidth("42rem");
        oSettingsDialog.open();
      });
    },

    onDialogCloseButton: function () {
      this._pSettingsDialog.then(function (oSettingsDialog) {
        oSettingsDialog.close();
      });
    },

    onAfterRendering: function () {

      //hide footer
      //this.getView().byId("otbFooter").setVisible(false); //hide the footer initially
    },

    _toggleButtonsAndView: function (bEdit) {
      var oView = this.getView();

      // Show the appropriate action buttons
      oView.byId("otbFooter").setVisible(bEdit);
      oView.byId("editBtn").setVisible(!bEdit);
      oView.byId("deleteBtn").setVisible(!bEdit);
      oView.byId("closeButton").setVisible(!bEdit);
      // Set the right form type

      this.getView().getModel("masterTaskManagementModel")?.refresh();
      this._showFormFragment(bEdit ? "ChangeTaskDetail" : "DisplayTaskDetail");
    },

    handleCancelPress: function () {

      //Restore the data
      var oModel = this.getView().getModel("masterTaskManagementModel");
      var oData = oModel.getData();
      MessageBox.warning(
        "Your entries will be lost when you leave this page", {
          title: "Warning",
          actions: [
            "Leave Page",
            sap.m.MessageBox.Action.CANCEL
          ],
          emphasizedAction: "Leave Page",
          onClose: (oEvent) => {
            if (oEvent === "Leave Page") {
              oData[this._task] = this._otask; //set the deep copied object here

              oModel.setData(oData);
              this._toggleButtonsAndView(false);
              this.getView().getModel("masterTaskManagementModel").refresh(); //refresh model
            }
          }
        }
      );

      //	this.handleFullScreen();

    },

    handleSavePress: function () {
      const payload = this.getOwnerComponent().getModel("editTaskManagementModel").getData();
      const issueId = payload._id;
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;

      ApiHandlers.handlePutApiCall(`https://task-manage-dissertation.herokuapp.com/issues/${issueId}`, payload).then((data) => {
        this.setIssuesData(data._id);
        this.loadIssueComments(data._id);
        MessageToast.show("Issue has been updated successfully.");
        this.toggleButtonsAndView(false);
      }).catch((err) => {
        MessageBox.error("Issue cannot be updated at the moment.");
      });

    },

    updateTaskAssigneeInfo: function (oEvent) {
      const sSelectedItem = oEvent.getSource().getSelectedItem().getText();
      this.getOwnerComponent().getModel("editTaskManagementModel").setProperty("/taskAssigneeName", sSelectedItem);
    },

    onPost: function (oEvent) {
      const aWebUrlItems = window.location.href.split("/");
      const sIssueID = aWebUrlItems[aWebUrlItems.length - 1], sUsername = this._userName;
      const sMessage = oEvent.getParameter("value");
      const payload = {
        from: sUsername,
        message: sMessage,
        issueId: sIssueID,
        time: new Date()
      };
      const oThis = this;
      ApiHandlers.handlePostApiCall("https://task-manage-dissertation.herokuapp.com/comments", payload).then((comment) => {
        oThis.loadIssueComments(comment.issueId);
      }).catch((err) => {
        MessageToast.show(err);
      });
    },

    handleFullScreen: function () {
      this.bFocusFullScreenButton = true;
      var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
      this.navigateToView(sNextLayout, "detailDetail");
    },

    handleExitFullScreen: function () {
      this.bFocusFullScreenButton = true;
      var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
      this.navigateToView(sNextLayout, "detailDetail");
    },

    handleClose: function () {
      var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
      this.navigateToView(sNextLayout, "detail");
    },

    navigateToView: function (sNextLayout, sNextView) {
      this.oRouter.navTo(sNextView, {
        layout: sNextLayout,
        userName: this._userName, //url param
        task: this._task //url param
      });
    },

    _getFormFragment: function (sFragmentName) {
      var pFormFragment = this._formFragments[sFragmentName],
        oView = this.getView();

      if (!pFormFragment) {
        pFormFragment = Fragment.load({
          id: oView.getId(),
          name: "taskmanagementtool.fragments." + sFragmentName,
          controller: this
        });
        this._formFragments[sFragmentName] = pFormFragment;
      }

      return pFormFragment;
    },

    _showFormFragment: function (sFragmentName) {
      var oPage = this.getView().byId("GeneralInfo");
      var that = this;
      oPage.removeAllBlocks();
      this._getFormFragment(sFragmentName).then(function (oVBox) {
        oPage.addBlock(oVBox);
        if (sFragmentName !== "DisplayTaskDetail") {
          //	Sets the text to the label
          that.byId("UploadCollection").addEventDelegate({
            onBeforeRendering: function () {
              that.byId("attachmentTitle").setText(that.getAttachmentTitleText());
            }.bind(that)
          });
        }
      }).then(function () {
        that.getView().byId("ObjectPageLayout").setSelectedSection(that.getView().byId("GeneralInfo").getId());
      });
    }
  });
});
