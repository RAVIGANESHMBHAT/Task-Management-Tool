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
      } else if (sState === "Completed") {
        return "Indication04";
      } else {
        return "None";
      }
    },

    getPriorityIcon: function (sVal) {
      if (sVal === "Low") {
        return "sap-icon://arrow-bottom";
      } else if (sVal === "Medium") {
        return "sap-icon://circle-task-2";
      } else {
        return "sap-icon://arrow-top";
      }
    },

    formatDate: function (date) {
      return new Date(date).toString().substr(0, 24);
    }

  };
});
