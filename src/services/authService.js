"use strict";

const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export async function login(username, password, keyCloakToken) {
  sessionStorage.setItem("token", keyCloakToken);
  sessionStorage.setItem("username", username.user);
  sessionStorage.setItem("displayName", username.user); //TODO: change with fullname
  if (keyCloakToken)
    sessionStorage.setItem("header", `Bearer ${keyCloakToken}`);
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("displayName");
  if (mode === "lite") {
    sessionStorage.removeItem("header");
  }
}

export function getCurrentUser() {
  return sessionStorage.getItem("username");
}

export function getAuthHeader() {
  const header = sessionStorage.getItem("header");
  if (header) return header;
  return undefined;
}

export default {
  login,
  logout,
  getCurrentUser,
  // getAuthHeader,
  getAuthHeader1
};
