import { Component, OnInit } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { CognitoUser } from 'amazon-cognito-identity-js';
import Auth from '@aws-amplify/auth';
import { AmplifyConfigurationService } from '../setup/amplify-configuration.service';
import { from, Subscription } from 'rxjs';
import { UsersService } from '../users/cognito-identity-service-provider.service';
import * as cognitoidentity from 'aws-sdk/clients/cognitoidentity';
import { resolve } from 'dns';
const AWS = require('aws-sdk/global');
const CognitoIdentityServiceProvider = require('aws-sdk/clients/cognitoidentityserviceprovider');
var DynamoDB = require('aws-sdk/clients/dynamodb');
@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {

  public state: any = null;

  /**
   * expose the user data to the template
   */
  public currentUserInfoData: any | null = null;
  public currentAuthenticatedUserData: any | null = null;
  public currentCredentialsData: any | null = null;
  public currentSessionData: any | null = null;
  public currentUserCredentialsData: any | null = null;
  public currentUserPoolUserData: any | null = null;
  public cognitoUser: CognitoUser | null = null;

  /**
   * expose the entire authState to the template
   */
  public authState: any;

  /**
   * reference to later unsubscribe
   */
  private amplifyServiceSubscription: Subscription | null = null;

  /**
   * reference to later unsubscribe
   */
  private currentUserInfoSubscription: Subscription | null = null;
  private currentAuthenticatedUserSubscription: Subscription | null = null;
  private currentCredentialsSubscription: Subscription | null = null;
  private currentSessionSubscription: Subscription | null = null;
  private currentUserCredentialsSubscription: Subscription | null = null;
  private currentUserPoolUserSubscription: Subscription | null = null;

  /**
   * Injected the needed services
   */
  constructor(
    private amplifyService: AmplifyService,
    public amplifyConfigService: AmplifyConfigurationService
  ) { }

  /**
   * Success handler
   */
  private success(data: any) {
    console.log(data);
    alert('Success');
  }

  /**
   * Error handler
   */
  private failure(data: any) {
    console.log(data);
    alert(
      'Failure\ncode: ' +
      data.code +
      '\nname: ' +
      data.name +
      '\nmessage: ' +
      data.message
    );
  }

  /**
   * Perform sign up
   */
  

  /**
   * Perform confirm sign up
 
  /**
   * Perform sign in
   */
  public fetch(event: Event, name: string){
    AWS.config.region = this.amplifyConfigService.configurationObj.region;
    return Auth.currentSession().then(async currentSession => {
      // use the IdToken from the current session to get the credetials
      const loginValue = currentSession.getIdToken().getJwtToken();
      const loginKey = ('cognito-idp.' + this.amplifyConfigService.configurationObj.region + '.amazonaws.com/' +
        this.amplifyConfigService.configurationObj.userPoolId);

      // if credetials are good do not bother with refresh()
      if (AWS.config.credentials && AWS.config.credentials.expired === false) {
        return;
      }
      // setup where to get the credentials from
      //var t;
      /*var x= Auth.currentSession().then(data => {
       t=data.getIdToken().payload['cognito:roles'];
       console.log(t);
      });*/

      function getroles() {

            return Auth.currentSession().then(function(data){
              var t=data.getIdToken().payload['cognito:roles'];
              return t;
            })
        }
    
    
    const role = await getroles();
    //const roles= JSON.stringify(role);
      //var y=x.then(result=>{console.log(result)});
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.amplifyConfigService.configurationObj.identityPoolId,
        CustomRoleArn:role[1],
        Logins: {
          [loginKey]: loginValue
        }
      });
      console.log('loginvalue :'+role[1]);
      AWS.config.credentials.refresh(() => { });
      
      AWS.config.credentials.get(function(err: any){
        if (!err) {
          var idtoken=currentSession.getIdToken().getJwtToken();
          var id = AWS.config.credentials.identityId;
          console.log('Cognito Identity ID '+ idtoken);
          console.log('Cognito ID '+ id);
          // Instantiate aws sdk service objects now that the credentials have been updated
         // var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });

          // Instantiate aws sdk service objects now that the credentials have been updated
          var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
          var param1={
            TableName: 'mytable'
          }
          docClient.scan(param1, function(err: any, data: any) {
            if (err) 
			        console.error(err);
            else {
              data.Items.forEach(function(item: { userid: string; Username: string; }) {
              console.log(" -", item.userid + ": " + item.Username);
            });
            }
			        
          });
          var params = {
            TableName: 'mytable',
            Item:{userid:id, Username:name}
          };
          docClient.put(params, function(err: any, data: any) {
            if (err){
              console.error(err);
              alert('Not Authorized');
            }
            else 
			        console.log(JSON.stringify(data));
          });
          /*var params = {
            TableName: 'employee',
            FilterExpression: '#name = :name', // optional
            ExpressionAttributeValues: { ':name': 'Ankit' }, // optional
            ExpressionAttributeNames: { '#name': 'Name' }, // optional
          };
           docClient.scan(params, function(err: any,data: any){
                if(err){
            console.log(err)
        }else{
            console.log(data)
        }
        });*/
        }
        else{
          console.log(err);
        }
      });
      // refresh the credentials
      
    });
    
  }
  public signIn(event: Event, user: string, password: string) {
    event.preventDefault();
    // Auth.signIn
    this.amplifyService.auth().signIn(user, password)
      .then((cognitoUser: CognitoUser | any) => {
        this.success(cognitoUser);
        this.cognitoUser = cognitoUser;
      })
      .catch((error: any) => {
        this.failure(error);
      });
  }

  
  /**
   * Complete New Password
   */
  

  /**
   * Get the various forms of user data available from the Amplify library
   */
  public getUserData(): void {

    // currentAuthenticatedUser()
    this.currentAuthenticatedUserSubscription = from(this.amplifyService.auth().currentAuthenticatedUser()).subscribe(
      data => {
        this.currentAuthenticatedUserData = data;
        this.currentAuthenticatedUserSubscription?.unsubscribe();
      }
    );

    // currentCredentials()
    this.currentAuthenticatedUserSubscription = from(this.amplifyService.auth().currentCredentials()).subscribe(
      data => {
        this.currentCredentialsData = data;
        this.currentCredentialsSubscription?.unsubscribe();
      }
    );

    // currentCredentials()
    this.currentSessionSubscription = from(this.amplifyService.auth().currentSession()).subscribe(
      data => {
        this.currentSessionData = data;
        this.currentSessionSubscription?.unsubscribe();
      }
    );

    // currentUserCredentials()
    this.currentSessionSubscription = from(this.amplifyService.auth().currentUserCredentials()).subscribe(
      data => {
        this.currentUserCredentialsData = data;
        this.currentUserCredentialsSubscription?.unsubscribe();
      }
    );

    // currentUserInfo()
    this.currentUserInfoSubscription = from(this.amplifyService.auth().currentUserInfo()).subscribe(
      data => {
        this.currentUserInfoData = data;
        this.currentUserInfoSubscription?.unsubscribe();
      }
    );

    // currentUserPoolUser()
    this.currentUserInfoSubscription = from(this.amplifyService.auth().currentUserPoolUser()).subscribe(
      data => {
        this.currentUserPoolUserData = data;
        this.currentUserPoolUserSubscription?.unsubscribe();
      }
    );

  }

  /**
   * Handles when the component is first created
   */
  ngOnInit() {
    // setup listener for auth state change
    this.amplifyServiceSubscription = this.amplifyService.authStateChange$.subscribe((authState) => {
      // save the returned state
      this.state = authState.state;
    });

    this.getUserData();
  }

  /**
   * Handle when the component is destroyed
   */
  public ngOnDestroy(): void {
    if (this.amplifyServiceSubscription) {
      this.amplifyServiceSubscription.unsubscribe();
    }
  }

}
