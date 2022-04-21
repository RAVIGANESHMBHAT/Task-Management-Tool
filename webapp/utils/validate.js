sap.ui.define([], function () {
	"use strict";

	return {
	
		//validate user name in login page
		validateUserName: function (userData, userNameInputValue) {
		let bUserExists = userData.some(user => (user.name).toLowerCase() === userNameInputValue.toLowerCase());
		
		let oErrObj = {
			bErrorExist:false,
			sErrorText:""
		};
		
		
		if(userNameInputValue === "" || userNameInputValue === null) {
			oErrObj.bErrorExist = true;
			oErrObj.sErrorText = "User Name cannot be Empty";
		}
		else if(userNameInputValue.length > 15) {
			oErrObj.bErrorExist = true;
			oErrObj.sErrorText = "User Name cannot exceed more than 15 characters";
		}
		
		else if(!bUserExists){
			oErrObj.bErrorExist = true;
			oErrObj.sErrorText = "User not registered, kindly register below";
		}
		
		return oErrObj;
		}
	};
});