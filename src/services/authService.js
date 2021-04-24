'use strict';

import { IDENTITY_CONFIG, METADATA_OIDC } from '../Utils/authConst';
import { UserManager, WebStorageStateStore, Log } from 'oidc-client';

const urls = {};

import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

const apiUrl = sessionStorage.getItem('apiUrl');
const mode = sessionStorage.getItem('mode');
// we need the keycloak object to be able to use update token
let keycloak = null;

export function refreshToken(keycloak, minValidity) {
  return new Promise((resolve, reject) => {
    keycloak
      .updateToken(minValidity)
      .success(function(refreshed) {
        if (refreshed) {
          // console.log("Token was successfully refreshed");
        } else {
          // console.log("Token is still valid");
        }
        resolve();
      })
      .error(function() {
        reject();
      });
  });
}

export async function login(username, password, keycloak) {
  sessionStorage.setItem('username', username.user);
  sessionStorage.setItem('displayName', username.user); //TODO: change with fullname
  if (keycloak) {
    this.keycloak = keycloak;
  }
}

export function logout() {
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('displayName');
  if (mode === 'lite') {
    sessionStorage.removeItem('header');
  }
  sessionStorage.removeItem('lastSavedAim');
}

export function getCurrentUser() {
  return sessionStorage.getItem('username');
}

export async function getAuthHeader() {
  if (this.keycloak) {
    try {
      await refreshToken(this.keycloak, 5);
      const header = `Bearer ${this.keycloak.token}`;
      if (header) {
        cornerstoneWADOImageLoader.configure({
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', header);
          }
        });
        return header;
      }
    } catch (err) {
      this.keycloak.logout();
    }
  }
  return undefined;
}

export class AuthService {
  UserManager;

  constructor() {
    this.UserManager = new UserManager({
      // response_mode:"query",
      ...IDENTITY_CONFIG,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      metadata: {
        ...METADATA_OIDC
      }
    });
    // Logger
    Log.logger = console;
    Log.level = Log.DEBUG;
    this.UserManager.events.addUserLoaded(user => {
      console.log('in the event', user);
      // if (window.location.href.indexOf('signin-oidc') !== -1) {
      //   this.navigateToScreen();
      // }
    });

    this.UserManager.events.addSilentRenewError(e => {
      console.log('silent renew error', e.message);
    });

    this.UserManager.events.addAccessTokenExpired(() => {
      console.log('token expired');
      this.signinSilent();
    });
  }

  signinRedirectCallback = async () => {
    const user = await this.UserManager.signinRedirectCallback();
    console.log('callback user', user);
    return user;
  };

  getUser = async () => {
    let user = await this.UserManager.getUser();
    if (!user) {
      user = await this.UserManager.signinRedirectCallback();
      console.log('user in redirect', userRes);
      window.alert(userRes);
      return userRes;
      // window.location.href = 'http://localhost:3000';

      // return await this.UserManager.signinRedirectCallback();
    }
    return user;
    // this.UserManager.getUser()
    //   .then(user => {
    //     console.log(' ---> user rsolved : this.UserManager.getUser', user);
    //     if (!user) {
    // this.UserManager.signinSilent()
    //   .then(res => {
    //     console.log('res: this.UserManager.signinSilent', res);
    //   })
    //   .catch(err1 => {
    //     console.error('catch for signinSilent', err1);
    // this.UserManager.signinRedirectCallback()
    //   .then(user => {
    //     console.log('user in redirect', user);
    //     window.alert(user);
    //     // window.location.href = 'http://localhost:3000';
    //   })
    //   .catch(error => {
    //     console.error('catch for signinRedirectCallback', error);
    //   });
    // return await this.UserManager.signinRedirectCallback();
    // }
    // return user;
    // });
    // }
    // })
    // .catch(err => console.error('catch for getUser', err));
  };

  parseJwt = token => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };

  signinRedirect = async () => {
    localStorage.setItem('redirectUri', window.location.pathname);
    await this.UserManager.signinRedirect({});
  };

  signinRedirectPopUp = () => {
    localStorage.setItem('redirectUri', window.location.pathname);
    this.UserManager.signinPopup({});
  };

  navigateToScreen = () => {
    window.location.replace('/');
  };

  isAuthenticated = () => {
    const oidcStorage = JSON.parse(
      sessionStorage.getItem(
        // `oidc.user:${process.env.REACT_APP_AUTH_URL}:${process.env.REACT_APP_IDENTITY_CLIENT_ID}`
        `oidc.user:http://bds-c02xf0r0jhd5.local:8899/auth:epad-auth`
      )
    );
    console.log('in here!!! authenticated', !!oidcStorage);
    // console.log(!!oidcStorage && !!oidcStorage.access_token);
    // return (!!oidcStorage && !!oidcStorage.access_token);
    return !!oidcStorage;
  };

  signinSilent = () => {
    this.UserManager.signinSilent()
      .then(user => {
        console.log('signed in', user);
      })
      .catch(err => {
        console.log(err);
      });
  };
  signinSilentCallback = () => {
    this.UserManager.signinSilentCallback();
  };

  createSigninRequest = () => {
    return this.UserManager.createSigninRequest();
  };

  logout = () => {
    this.UserManager.signoutRedirect({
      id_token_hint: localStorage.getItem('id_token')
    });
    this.UserManager.clearStaleState();
  };

  signoutRedirectCallback = () => {
    this.UserManager.signoutRedirectCallback().then(() => {
      localStorage.clear();
      // window.location.replace(process.env.REACT_APP_PUBLIC_URL);
      window.location.replace('/');
    });
    this.UserManager.clearStaleState();
  };
}

export default {
  login,
  logout,
  getCurrentUser,
  getAuthHeader,
  refreshToken,
  AuthService
};
