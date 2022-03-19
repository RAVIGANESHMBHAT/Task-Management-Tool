sap.ui.define(["sap/ui/test/Opa5"], function (Opa5) {
    "use strict";

    return Opa5.extend("com.ravi.dissertation.TaskManagementTool.test.integration.arrangements.Startup", {
        iStartMyApp: function () {
            this.iStartMyUIComponent({
                componentConfig: {
                    name: "com.ravi.dissertation.TaskManagementTool",
                    async: true,
                    manifest: true
                }
            });
        }
    });
});
