import { Config, CognitoIdentityCredentials} from "aws-sdk";
import appConfig from "./config";
import { CognitoUserPool } from "amazon-cognito-identity-js";

Config.region= appConfig.region;
Config.credentials= new CognitoIdentityCredentials({ IdentityPoolId: appConfig.IdentityPoolId });

let userPool= new CognitoUserPool({ UserPoolId: appConfig.UserPoolId, ClientId: appConfig.ClientId });

module.exports = { userPool };