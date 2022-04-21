sap.ui.define([], function () {
    "use strict";
    return {
      formatTaskState: function (sState) {
        if (sState === "Open") {
          return "Warning";
        } else if (sState === "In Progress") {
          return "Information";
        } else if (sState === "Blocked") {
          return "Error";
        } else {
          return "Indication04";
        }
      },
    };
});
