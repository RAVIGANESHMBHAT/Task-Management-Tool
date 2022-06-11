sap.ui.define([
  "taskmanagementtool/helpers/Api"
], function (Api) {
  return {
    getAllIssues: function () {
      return new Promise((resolve, reject) => {
        Api.get("https://task-manage-dissertation.herokuapp.com/issues", {}).done(function (issues, s, x) {
          if (issues.length > 0) {
            resolve(issues);
          } else {
            reject("No issues found.");
          }
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    },

    createProject: function (projectPayload) {
      return new Promise((resolve, reject) => {
        Api.post("https://task-manage-dissertation.herokuapp.com/projects", JSON.stringify(projectPayload))
          .done(function (project, s, x) {
            resolve(project);
          })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    },

    handleGetApiCall: function (url, opts) {
      return new Promise((resolve, reject) => {
        Api.get(url, opts).done(function (data, s, x) {
          if (typeof (data) === "object" || data.length > 0) {
            resolve(data);
          } else {
            reject("No data found.");
          }
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    },

    handlePostApiCall: function (url, payload) {
      return new Promise((resolve, reject) => {
        Api.post(url, JSON.stringify(payload)).done(function (data, s, x) {
          resolve(data);
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    },

    handleDeleteApiCall: function (url, opts) {
      return new Promise((resolve, reject) => {
        Api.del(url, opts).done(function (data, s, x) {
          resolve(data);
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    },

    handlePutApiCall: function (url, payload) {
      return new Promise((resolve, reject) => {
        Api.put(url, JSON.stringify(payload)).done(function (data, s, x) {
          resolve(data);
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });
    }
  };
});
