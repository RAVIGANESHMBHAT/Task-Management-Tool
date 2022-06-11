sap.ui.define([
  "taskmanagementtool/helpers/Api"
], function (Api) {
  "use strict";

  return {

    //validate user name in login page
    validateUserName: function (userData, userNameInputValue, passwordInputValue) {
      return new Promise((resolve, reject) => {
        Api.get("https://task-manage-dissertation.herokuapp.com/users", {}).done(function (users, s, x) {
          const user = users.filter(user => user.name.toLowerCase() === userNameInputValue.toLowerCase());
          if (user.length > 0) {
            if (user[0].password !== passwordInputValue) {
              reject("Password doesn't match");
            }
            resolve(user);
          } else {
            reject("No user found with the mentioned credentials.");
          }
        })
          .fail(function (d, s, x) {
            reject(d);
          });
      });

    }
  };
});

