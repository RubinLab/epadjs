"use strict";

import { IDENTITY_CONFIG, METADATA_OIDC } from "../Utils/authConst";
import { UserManager, WebStorageStateStore, Log } from "oidc-client";

import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
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
  sessionStorage.setItem("username", username.user);
  sessionStorage.setItem("displayName", username.user); //TODO: change with fullname
  if (keycloak) {
    this.keycloak = keycloak;
  }
}

export function logout() {
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("displayName");
  if (mode === "lite") {
    sessionStorage.removeItem("header");
  }
  sessionStorage.removeItem("lastSavedAim");
}

export function getCurrentUser() {
  return sessionStorage.getItem("username");
}

export async function getAuthHeader() {
  if (this.keycloak) {
    try {
      await refreshToken(this.keycloak, 5);
      const header = `Bearer ${this.keycloak.token}`;
      if (header) {
        cornerstoneWADOImageLoader.configure({
          beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", header);
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

class AuthService {
  UserManager;

  constructor() {
    this.UserManager = new UserManager({
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
      if (window.location.href.indexOf("signin-oidc") !== -1) {
        this.navigateToScreen();
      }
    });

    this.UserManager.events.addSilentRenewError(e => {
      console.log("silent renew error", e.message);
    });

    this.UserManager.events.addAccessTokenExpired(() => {
      console.log("token expired");
      this.signinSilent();
    });
  }

  signinRedirectCallback = () => {
    this.UserManager.signinRedirectCallback().then(() => {
      "";
    });
  };

  getUser = async () => {
    const user = await this.UserManager.getUser();
    if (!user) {
      return await this.UserManager.signinRedirectCallback();
    }
    return user;
  };

  parseJwt = token => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  };

  signinRedirect = () => {
    localStorage.setItem("redirectUri", window.location.pathname);
    this.UserManager.signinRedirect({});
  };

  navigateToScreen = () => {
    window.location.replace("/en/dashboard");
  };

  isAuthenticated = () => {
    const oidcStorage = JSON.parse(
      sessionStorage.getItem(
        `oidc.user:${process.env.REACT_APP_AUTH_URL}:${process.env.REACT_APP_IDENTITY_CLIENT_ID}`
      )
    );

    return !!oidcStorage && !!oidcStorage.access_token;
  };

  signinSilent = () => {
    this.UserManager.signinSilent()
      .then(user => {
        console.log("signed in", user);
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
      id_token_hint: localStorage.getItem("id_token")
    });
    this.UserManager.clearStaleState();
  };

  signoutRedirectCallback = () => {
    this.UserManager.signoutRedirectCallback().then(() => {
      localStorage.clear();
      window.location.replace(process.env.REACT_APP_PUBLIC_URL);
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
