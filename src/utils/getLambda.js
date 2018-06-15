import AWS from 'aws-sdk';
import "../utils/getUserPool";

let credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: 'ap-northeast-1:b2306867-13db-4476-97f4-4bfb2fd8619b'
                });

AWS.config.update({region:"ap-northeast-1" , credentials});

var lambda = new AWS.Lambda();
module.exports = lambda;