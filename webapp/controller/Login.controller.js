sap.ui.define([
  "taskmanagementtool/controller/BaseController",
  "sap/ui/core/Fragment",
  "sap/m/Popover",
  "taskmanagementtool/model/models",
  "taskmanagementtool/utils/validate",
  "taskmanagementtool/utils/loginPageInit",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (BaseController, Fragment, Popover, models, validate, loginPageInit, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("taskmanagementtool.controller.Login", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     **/
    onInit: function () {
      this.oComponent = this.getOwnerComponent();
      ;
      this.oRouter = this.oComponent.getRouter(); //router for navigating to next page

    },

    /**
     * Method called on click of Login button
     * @public
     */
    onLogin: async function () {
      let oView = this.getView();
      let userData = this.oComponent.getModel("userModel").getData();
      let userNameInputValue = oView.byId("userId").getValue().trim();
      let passwordInputValue = oView.byId("pasw").getValue().trim();
      try {
        let oValidatedObject = await validate.validateUserName(userData, userNameInputValue, passwordInputValue);
        this._setValueStates(oView.byId("userId"), oValidatedObject.sErrorText, "reset");
        //route
        sap.ui.core.BusyIndicator.show(0);
        this.oRouter.navTo("detail", {
          layout: sap.f.LayoutType.OneColumn,
          userName: userNameInputValue
        });
        location.reload();

        oView.byId("userId").setValue(""); //after navigating successfully empty the user id

      } catch (err) {
        MessageBox.error(err);
        this._setValueStates(oView.byId("userId"), err);
      }
    },

    /**
     * Method to set the value states and texts
     * @public
     * @param {oControl} - UI control
     * @param {sText} - Error Text
     * @param {type} - error type text
     */
    _setValueStates: function (oControl, sText, type) {
      if (type === "error") {
        oControl.setValueState(sap.ui.core.ValueState.Error);
        oControl.setValueStateText(sText);
        this.getView().byId("loginUserErrMsgStrip").setVisible(true);
        this.getView().byId("loginUserErrMsgStrip").setText(sText);
      } else {
        oControl.setValueState(sap.ui.core.ValueState.None);
        oControl.setValueStateText("");
        this.getView().byId("loginUserErrMsgStrip").setVisible(false);
        this.getView().byId("loginUserErrMsgStrip").setText("");
      }

    },

    /**
     * Called when the View has been rendered (so its HTML is part of the document).
     * Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     */
    onAfterRendering: function () {

      loginPageInit._preparePwdValidationRendering(this, Popover); //popover initialization for password
    },

    /**
     * Method called on click of Register User link
     * @public
     */
    onRegisterUser: function () {

      let oView = this.getView();
      this._setValueStates(oView.byId("userId"), "", "new");

      //create a new model to fetch the data from dialog

      this.oComponent.setModel(models.loadUserModel(), "registerUserModel");

      // create dialog lazily
      if (!this.registerUserDialog) {
        this.registerUserDialog = Fragment.load({
          id: oView.getId(),
          name: "taskmanagementtool.fragments.RegisterUser",
          controller: this
        }).then(function (oDialog) {
          // connect dialog to the root view of this component (models, lifecycle)
          oView.addDependent(oDialog);
          return oDialog;
        });
        this._aUsers = [];
      }
      this.registerUserDialog.then(function (oDialog) {
        oDialog.open();
      });

    },

    /**
     * Method to close user registration dialog
     * @public
     */
    onCloseRegisterUserDialog: function () {
      // note: We don't need to chain to the pDialog promise, since this event-handler
      // is only called from within the loaded dialog itself.
      this.byId("registerUserDialog").close();
      this.getView().byId("regUserErrMsgStrip").setVisible(false);
    },

    /**
     * Method to validate password field in new user registration dialog
     * @public
     * @param {oEvent} - Event data
     */
    validatePassword: function (oEvent) {
      let oPopover = this.oPopover;
      oPopover.openBy(oEvent.getSource());
      let sNewValue = oEvent.getSource().getValue();
      let sUserName = this.getView().byId("idUserName").getValue();
      this.bFinalValidationResult = true;

      //function expression for updating the popup content on every live change event
      let setStatus = (oObjStatus, bResult, bInvertResult) => {
        if (bInvertResult) {
          bResult = !(bResult);
        }
        if (bResult) {
          oObjStatus.setState("Success");
          oObjStatus.setIcon("sap-icon://accept");
        } else {
          oObjStatus.setState("Error");
          oObjStatus.setIcon("sap-icon://decline");
          this.bFinalValidationResult = false;
        }
      };

      //regex check for the value entered in password field
      setStatus(this.oPopover.getContent()[0], (new RegExp("^.{" + 8 + ",}$")).test(sNewValue));
      setStatus(oPopover.getContent()[1], /[A-Z]/.test(sNewValue));
      setStatus(oPopover.getContent()[2], /(?=(.*[a-z]){2})/.test(sNewValue));
      setStatus(oPopover.getContent()[3], /[-+_!@#$%^&*.,?\d]/.test(sNewValue));
      setStatus(oPopover.getContent()[4], /[\'\[\"\`;\]]/.test(sNewValue), true);
      setStatus(oPopover.getContent()[5], (new RegExp(sUserName, "i")).test(sNewValue), true);
      setStatus(oPopover.getContent()[6], /\s/.test(sNewValue), true);
    },

    /**
     * Method called on registering a new user
     * @public
     */
    onCreateUser: function () {
      let oView = this.getView();
      let userNameInputValue = oView.byId("idUserName").getValue();
      oView.byId("regUserErrMsgStrip").setVisible(false);
      let aUserData = this.oComponent.getModel("userModel").getData();
      let bUserExists = aUserData.some(user =>
        (user.name).toLowerCase() === userNameInputValue.toLowerCase()); //check if the already exists while registration

      // check for validations and perform registration of an user accordingly
      if (this.bFinalValidationResult && oView.byId("idUserName") !== "" && !bUserExists) {
        let aUserData = this.oComponent.getModel("userModel").getData();
        let aRegisteredUserData = this.oComponent.getModel("registerUserModel").getData();
        aUserData.push(aRegisteredUserData);
        this.oComponent.getModel("userModel").setData(aUserData);
        this.oComponent.getModel("userModel").refresh();
        MessageToast.show("User Registered Successfully");
        this.byId("registerUserDialog").close();
      } else {
        this.getView().byId("regUserErrMsgStrip").setVisible(true);
      }
    }
  });
});
