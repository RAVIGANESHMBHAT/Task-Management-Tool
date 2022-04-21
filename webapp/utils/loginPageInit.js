sap.ui.define([], function () {
	"use strict";

	return {
		// initialize popover related statuses for password validations
		_preparePwdValidationRendering: function (oController,Popover) {
			
			var oStatuses = [
				new sap.m.ObjectStatus({
					text: "At least 8 Characteres",
					icon: "sap-icon://decline",
					state: "Error"
				}),
				new sap.m.ObjectStatus({
					text: "Contains at least one UPPERCASE letter",
					icon: "sap-icon://decline",
					state: "Error"
				}),
				new sap.m.ObjectStatus({
					text: "Contains at least  two lowercase letters",
					icon: "sap-icon://decline",
					state: "Error"
				}),
				new sap.m.ObjectStatus({
					text: "Contains at least one number or symbol", //symbol?
					icon: "sap-icon://decline",
					state: "Error"
				}),
				new sap.m.ObjectStatus({
					text: "Does not contain \\ ' [ \" ` ; ]",
					icon: "sap-icon://accept",
					state: "Success"
				}),
				new sap.m.ObjectStatus({
					text: "Does not contain your user name",
					icon: "sap-icon://accept",
					state: "Success"
				}),
				new sap.m.ObjectStatus({
					text: "Does not contain control characters (space, tab, etc)",
					icon: "sap-icon://accept",
					state: "Success"
				})
			];

			oController.oPopover = new Popover({
				contentWidth: "25rem",
				showHeader: false,
				content: oStatuses,
				placement: sap.m.PlacementType.HorizontalPreferredRight,
				afterOpen: function (oEvent) {
					//console.log("afterOpen", oEvent.getParameters());
					oEvent.getParameters().openBy.focus();
				}
			});
			oController.oPopover.addStyleClass("sapUiContentPadding");
		
			
		}
	};
});