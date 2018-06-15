import * as types from './actionTypes';
import toastr from '../../utils/toastr';

import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import { userPool } from "../../utils/getUserPool";
import { hashHistory } from 'react-router';



var CognitoUserReference = (function () {
    
    var cognitoUser,authenticationDetails,awsUserAttributes;

    function createCognitoUser(credentials) {
    let userData= { Username:credentials.Username , Pool: userPool };
    cognitoUser= new CognitoUser(userData);
    authenticationDetails= new AuthenticationDetails(credentials); 

    }
 
    return {
        createNewCognitoUser: function (credentials) {
            createCognitoUser(credentials);
            return { cognitoUser, authenticationDetails };
        },
        setAwsAttributes: function (awsUserAttributesProps) {
            awsUserAttributes = awsUserAttributesProps ;
        },
        getCognitoUser:function (credentials) {
            return { cognitoUser, awsUserAttributes };
        }
    };
})();



export function loginSuccess() {  
    let { state = { nextPathname:'/'} } = hashHistory.getCurrentLocation();
    hashHistory.push(state.nextPathname);
    return {type: types.LOG_IN_SUCCESS};
}

export function logOutUser() {  
  localStorage.removeItem('jwt');
  hashHistory.push("/");
  return {type: types.LOG_OUT};
  
}

export function toggleLoader() {  
  return {type: types.TOGGLE_LOADER};
}

export function toogleFirstTimePasswordNeeded() {  
  return {type: types.FIRST_TIME_PASSWORD};
}

export function setNewPassword(credentials) {

   return function(dispatch) {
     
     let { cognitoUser , awsUserAttributes } = CognitoUserReference.getCognitoUser(credentials);   
     
     // the api doesn't accept this field back
        delete awsUserAttributes.email_verified;
        delete awsUserAttributes.phone_number_verified;

    return cognitoUser.completeNewPasswordChallenge(credentials.Password,awsUserAttributes,{
       onSuccess: function (result) {
                   toastr["success"]("Your new password has been set , Please login again");
                    dispatch(toggleLoader());
                    dispatch(toogleFirstTimePasswordNeeded());
                },
      onFailure: function(err) {
              toastr["error"](err.message, "PASSWORD CHANGE ERROR");
              dispatch(toggleLoader());
          }
    });
    
  };
}

export function logInUser(credentials) {
  
  return function(dispatch) {
    
    let { cognitoUser, authenticationDetails } = CognitoUserReference.createNewCognitoUser(credentials);

    
    return cognitoUser.authenticateUser( authenticationDetails, {
            onSuccess: function (result) {
                    localStorage.setItem('jwt', result.getAccessToken().getJwtToken());
                    toastr["success"]("Login Successful");
                    dispatch(loginSuccess());
                },
            onFailure: function(err) {
                    toastr["error"](err.message, "LOGIN ERROR");
                    dispatch(toggleLoader());
                },
            newPasswordRequired: function(userAttributes, requiredAttributes) {
                  dispatch(toogleFirstTimePasswordNeeded());
                  dispatch(toggleLoader());
                  CognitoUserReference.setAwsAttributes(userAttributes);
            }
    });
    
  };
  
  
}


            


    
    