import { Injectable } from '@angular/core';
import { defer, BehaviorSubject } from 'rxjs';
import Auth from '@aws-amplify/auth';
import { AmplifyConfigurationService } from '../setup/amplify-configuration.service';
// AWS global namespace
const AWS = require('aws-sdk/global');
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html
const CognitoIdentityServiceProvider = require('aws-sdk/clients/cognitoidentityserviceprovider');

/**
 * Service to connect to AWS CognitoIdentityServiceProvider
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  /**
   * Reference to the cognito userPoolId
   */
  private userPoolId: string;

  /**
   * Meta data for the various user attributes
   */
  public metaData: any[] = [
    {
      value: 'email',
      label: 'Email'
    },
    {
      value: 'status',
      label: 'Enabled',
      options: [
        {
          label: 'Enabled',
          value: 'Enabled'
        },
        {
          label: 'Disabled',
          value: 'Disabled'
        }
      ]
    },
    {
      value: 'family_name',
      label: 'Family Name'
    },
    {
      value: 'given_name',
      label: 'Given Name'
    },
    {
      value: 'name',
      label: 'Name'
    },
    {
      value: 'phone_number',
      label: 'Phone Number'
    },

    {
      value: 'preferred_username',
      label: 'Preferred Name'
    },
    {
      value: 'cognito:user_status',
      label: 'Status',
      options: [
        {
          label: 'Archived',
          value: 'ARCHIVED'
        },
        {
          label: 'Compromised',
          value: 'COMPROMISED'
        },
        {
          label: 'Confirmed',
          value: 'CONFIRMED'
        },
        {
          label: 'Force Change Password',
          value: 'FORCE_CHANGE_PASSWORD'
        },
        {
          label: 'Reset Required',
          value: 'RESET_REQUIRED'
        },
        {
          label: 'Unconfirmed',
          value: 'UNCONFIRMED'
        },
        {
          label: 'Unknown',
          value: 'UNKNOWN'
        }
      ]
    },
    {
      value: 'sub',
      label: 'Sub'
    },
    {
      value: 'username',
      label: 'Username'
    }
  ];

  /**
   * Track the available groups loaded from the API into the metaData
   */
  private groupOptionsSubject = new BehaviorSubject<any>(null);

  /**
   * Enabled other components to observe changes in the groupOptions
   */
  public groupOptions = this.groupOptionsSubject.asObservable();

  /**
   * On construction injects the needed services
   */
  constructor(private amplifyConfiguration: AmplifyConfigurationService) {
    // load userPoolId
    this.userPoolId = this.amplifyConfiguration.configurationObj.userPoolId;
    // sort the attributes
    this.metaData.sort(this.attributeSort);
  }

  /**
   * Provide a function to sort the metaData attributes by label
   */
  private attributeSort(attribA: any, attribB: any) {
    if (attribA.label < attribB.label) { return -1; }
    if (attribA.label > attribB.label) { return 1; }
    return 0;
  }

  /**
   * Return the options for a given attribute
   */
  public getAttributeByValue(attribute: string) {
    return this.metaData.filter(attrib => {
      return attrib.value === attribute;
    });
  }

  /**
   * Set credentials
   */
  public async setCredentials() {
    // set region based on saved configuration
    AWS.config.region = this.amplifyConfiguration.configurationObj.region;
    return Auth.currentSession().then(currentSession => {
      // use the IdToken from the current session to get the credetials
      const loginValue = currentSession.getIdToken().getJwtToken();
      const loginKey = ('cognito-idp.' + this.amplifyConfiguration.configurationObj.region + '.amazonaws.com/' +
        this.amplifyConfiguration.configurationObj.userPoolId);

      // if credetials are good do not bother with refresh()
      if (AWS.config.credentials && AWS.config.credentials.expired === false) {
        return;
      }
      // setup where to get the credentials from
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.amplifyConfiguration.configurationObj.identityPoolId,
        Logins: {
          [loginKey]: loginValue
        }
      });
      // refresh the credentials
      AWS.config.credentials.refresh(() => { });
    });
  }

  /**
   * Provide a common async call to wrap credetials and API call
   */
  private async providerAsync(name: string, params: any) {
    // hit the set credentials for the user
    await this.setCredentials();
    // add required parameters from the saved configuration
    const queryParams = { ...params };
    queryParams.UserPoolId = this.userPoolId;
    const provider = new CognitoIdentityServiceProvider();
    return provider[name](queryParams).promise();
  }

  /**
   * Provides a common call to wrap the API Promise in an Observable
   * @param name Name of the API method to call
   * @param params Params to pass to the method
   */
  public providerObservable(name: string, params: any) {
    // using defer to wrap the promse and wait for it to finish
    return defer(() => {
      return this.providerAsync(name, params);
    });
  }

  /**
   * List of Users as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#listUsers-property
   */
  public listUsers(params?: any) {
    return this.providerObservable('listUsers', params);
  }

  /**
   * AdminCreateUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminCreateUser-property
   * https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_AdminCreateUser.html
   */
  public adminCreateUser(params?: any) {
    return this.providerObservable('adminCreateUser', params);
  }

  /**
   * AdminGetUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminGetUser-property
   */
  public adminGetUser(params?: any) {
    return this.providerObservable('adminGetUser', params);
  }

  /**
   * AdminUpdateUserAttributes as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminUpdateUserAttributes-property
   */
  public adminUpdateUserAttributes(params?: any) {
    return this.providerObservable('adminUpdateUserAttributes', params);
  }

  /**
   * AdminEnableUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminEnableUser-property
   */
  public adminEnableUser(params?: any) {
    return this.providerObservable('adminEnableUser', params);
  }

  /**
   * AdminEnableUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminDisableUser-property
   */
  public adminDisableUser(params?: any) {
    return this.providerObservable('adminDisableUser', params);
  }

  /**
   * AdminDeleteUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminDeleteUser-property
   */
  public adminDeleteUser(params?: any) {
    return this.providerObservable('adminDeleteUser', params);
  }

  /**
   * ListUsersInGroup as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#listUsersInGroup-property
   */
  public listUsersInGroup(params?: any) {
    return this.providerObservable('listUsersInGroup', params);
  }

  /**
   * ListGroups as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#listGroups-property
   */
  public listGroups(params?: any) {
    return this.providerObservable('listGroups', params);
  }

  /**
   * AdminListGroupsForUser as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminListGroupsForUser-property
   */
  public adminListGroupsForUser(params?: any) {
    return this.providerObservable('adminListGroupsForUser', params);
  }

  /**
   * AdminAddUserToGroup as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminAddUserToGroup-property
   */
  public adminAddUserToGroup(params?: any) {
    return this.providerObservable('adminAddUserToGroup', params);
  }

  /**
   * AdminRemoveUserFromGroup as an Observable
   * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html#adminRemoveUserFromGroup-property
   */
  public adminRemoveUserFromGroup(params?: any) {
    return this.providerObservable('adminRemoveUserFromGroup', params);
  }

  /**
   * Update the metaData with the list of groups
   */
  public updateGroups() {
    if (this.groupOptionsSubject.value === null) {
      // get the group data
      this.listGroups().subscribe(data => {
        // if there are groups add them to the metaData
        if (data.Groups.length) {
          // remove previously added group_name attribute
          this.metaData = this.metaData.filter(attrib => {
            return attrib.value !== 'group_name';
          });
          // set group_name attribute
          const groupName: any = {
            value: 'group_name',
            label: 'Group',
            options: []
          };
          // set group_name attribute options
          data.Groups.forEach((group: { GroupName: any, Description: any }) => {
            groupName.options.push(
              {
                // add description to label if present
                label: group.GroupName + (group.Description ? ' (' + group.Description + ')' : ''),
                value: group.GroupName
              }
            );
          });
          this.metaData.push(groupName);
          // sort the attributes by label
          this.metaData.sort(this.attributeSort);
          // notify subscribers of group options
          this.groupOptionsSubject.next(groupName.options);
        }
      });
    }
  }

}
