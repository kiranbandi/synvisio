/*global $ */
import endPoints from './endPoints';
import lambda from './getLambda';
import toastr from './toastr';

var ajaxHelpers = {};

// Parameters required for invoking Lambda function
var pullParams = {
  FunctionName : 'choozago-api',
  InvocationType : 'RequestResponse',
  LogType : 'None'
};


ajaxHelpers.getStatus = function(locationCode) {

  let action = 'getStatus';
    
    let payLoad =JSON.stringify({ action, data: { locationCode } },null,2) ,
        pullParamsData = Object.assign({},pullParams,{Payload:payLoad})

    return $.Deferred(function( defer ) {
        
        lambda.invoke(pullParamsData, function(error, data) {
          if (error) {
                defer.reject();
                toastr["error"]("Network error please try again", "ERROR")
          } 
          else {
              var recordData = JSON.parse(data.Payload);
            if(!recordData) {
                toastr["error"]("No Records Found , Please try again")
            }
            defer.resolve(recordData);
          }
        });
    
    }).promise();

}


ajaxHelpers.ticketCall = function(ticketId,action) {
    
    let payLoad =JSON.stringify({ action, data: { ticketId } },null,2) ,
        pullParamsData = Object.assign({},pullParams,{Payload:payLoad})

    return $.Deferred(function( defer ) {
        
        lambda.invoke(pullParamsData, function(error, data) {
          if (error) {
                defer.reject();
                toastr["error"]("Network error please try again", "ERROR")
          } 
          else {
            var ticketStatus = JSON.parse(data.Payload);
            if(!ticketStatus) {
                toastr["error"]("No Records Found , Please try again")
            }
            defer.resolve(ticketStatus);
          }
        });
    
    }).promise();

  }
  
  
ajaxHelpers.getLoginToken = function(userid,password) {
    
    return $.Deferred(function( defer ) {
        defer.resolve('abc'); 
        }).promise();

  }
  
  
module.exports = ajaxHelpers;