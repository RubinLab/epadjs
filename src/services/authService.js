"use strict";

import { UserManager, WebStorageStateStore, Log } from "oidc-client";
const urls = {};
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
// we need the keycloak object to be able to use update token

// let keycloak = null;
let authService = null;

export async function login(username, password, keycloak) {
  sessionStorage.setItem("username", username.user);
  sessionStorage.setItem("displayName", username.user); //TODO: change with fullname
  if (keycloak) {
    this.keycloak = keycloak;
  }
}

export async function setLoginSession(username) {
  sessionStorage.setItem("username", username.user);
  sessionStorage.setItem("displayName", username.user); //TODO: change with fullname
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
  const API_KEY = sessionStorage.getItem("API_KEY");
  if (API_KEY) {
    const header = `apikey ${API_KEY}`;
    if (header) {
      cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", header);
        },
      });
      return header;
    }
  } else if (this.keycloak) {
    authService = new AuthService();
    try {
      const user = await authService.getUser();
      if (user.access_token) {
        const header = `Bearer ${user.access_token}`;

        if (header) {
          cornerstoneWADOImageLoader.configure({
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", header);
            },
          });
          return header;
        }
      }
    } catch (err) {
      authService.logout();
    }
    return undefined;
  }
}

export class AuthService {
  UserManager;
  constructor() {
    this.authority = sessionStorage.getItem("authority");
    this.client_id = sessionStorage.getItem("client_id");
    this.redirect_uri = sessionStorage.getItem("redirect_uri");
    this.response_type = sessionStorage.getItem("response_type");
    this.scope = sessionStorage.getItem("scope");
    const usermng = new UserManager({
      authority: this.authority,
      client_id: this.client_id,
      redirect_uri: this.redirect_uri,
      response_type: this.response_type,
      response_mode: "query",
      scope: this.scope,
      silent_redirect_uri: this.redirect_uri,
      automaticSilentRenew: true,
      loadUserInfo: true,
      post_logout_redirect_uri: this.redirect_uri,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
    });
    this.UserManager = usermng;
    // Logger
    Log.logger = console;
    Log.level = Log.INFO;
    this.UserManager.events.addUserLoaded((user) => {
      const { email, family_name, given_name, preferred_username } =
        user.profile;

      let userInfo = {
        user: preferred_username || email,
        displayname: given_name,
      };

      sessionStorage.setItem("username", userInfo.user);
      sessionStorage.setItem("displayName", userInfo.user);
    });

    this.UserManager.events.addSilentRenewError((e) => {
      console.log("silent renew error", e.message);
    });

    this.UserManager.events.addAccessTokenExpired(() => {
      this.logout();
    });
  }

  signinRedirectCallback = () => {
    this.UserManager.signinRedirectCallback()
      .then((user) => {
        window.location.href = "http://localhost:3000";
        // window.location.href = 'http://bds-c02xf0r0jhd5.local:3000';
      })
      .catch((err) => {
        console.error(err);
      });
  };

  getUser = async () => {
    let user = await this.UserManager.getUser();
    if (!user) {
      user = await this.UserManager.signinRedirectCallback();
      return userRes;
    }
    return user;
  };

  parseJwt = (token) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(window.atob(base64));
  };

  signinRedirect = async () => {
    this.UserManager.signinRedirect();
  };

  signinRedirectPopUp = () => {
    localStorage.setItem("redirectUri", window.location.pathname);
    this.UserManager.signinPopup({});
  };

  navigateToScreen = () => {
    window.location.replace("/");
  };

  isAuthenticated = () => {
    const oidcStorage = JSON.parse(
      sessionStorage.getItem(
        // `oidc.user:${process.env.REACT_APP_AUTH_URL}:${process.env.REACT_APP_IDENTITY_CLIENT_ID}`
        `oidc.user:${this.authority}:${this.client_id}`
      )
    );
    return !!oidcStorage && !!oidcStorage.access_token;
  };

  signinSilent = () => {
    this.UserManager.signinSilent()
      .then((user) => {})
      .catch((err) => {
        console.error(err);
      });
  };
  signinSilentCallback = () => {
    this.UserManager.signinSilentCallback();
  };

  createSigninRequest = () => {
    return this.UserManager.createSigninRequest();
  };

  logout = () => {
    console.log(" +++ logout +++ ");
    this.UserManager.signoutRedirect({
      id_token_hint: localStorage.getItem("id_token"),
    });
    // this.UserManager.signoutRedirect();
    this.UserManager.clearStaleState();
    // window.location.replace(this.redirect_uri);
  };

  signoutRedirectCallback = () => {
    this.UserManager.signoutRedirectCallback().then(() => {
      localStorage.clear();
      // window.location.replace(process.env.REACT_APP_PUBLIC_URL);
      window.location.replace(this.redirect_uri);
    });
    this.UserManager.clearStaleState();
  };
}

export default {
  setLoginKeycloak,
  setLoginSession,
  getCurrentUser,
  getAuthHeader,
  AuthService,
};
