"use strict";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";

const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
// we need the keycloak object to be able to use update token
let keycloak = null;

export function refreshToken(keycloak, minValidity) {
  return new Promise((resolve, reject) => {
    keycloak
      .updateToken(minValidity)
      .success(function (refreshed) {
        if (refreshed) {
          // console.log("Token was successfully refreshed");
        } else {
          // console.log("Token is still valid");
        }
        resolve();
      })
      .error(function () {
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
  const API_KEY = sessionStorage.getItem("API_KEY");
  if (this.keycloak) {
    try {
      await refreshToken(this.keycloak, 5);
      const header = `Bearer ${this.keycloak.token}`;
      console.log("header", header);
      if (header) {
        cornerstoneWADOImageLoader.configure({
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", header);
          },
        });
        return header;
      }
    } catch (err) {
      this.keycloak.logout();
    }
  } else if (API_KEY) {
    const header = `apikey ${API_KEY}`;
    console.log("header API_KEY", header);
    if (header) {
      cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", header);
        },
      });
      return header;
    }
  }
  return undefined;
}

export default {
  login,
  logout,
  getCurrentUser,
  getAuthHeader,
  refreshToken,
};
