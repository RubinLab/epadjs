import btoa from "btoa-lite";
import http from "./httpService";
import { apiUrlV1, clientKey } from "../config.json";
import { isLite } from "./../config.json";

const apiEndpoint = apiUrlV1 + "/session/";

export async function login(username, password, keyCloakToken) {
  let basicAuth;
  if (isLite) {
    console.log("keyclok token", keyCloakToken);
    basicAuth = "Bearer " + keyCloakToken;
    sessionStorage.setItem("token", keyCloakToken);
    sessionStorage.setItem("username", username.user);
    /*********************************** REMOVE IN PROD  **************************/
    sessionStorage.setItem("header", basicAuth);
  } else {
    basicAuth = "Basic " + btoa(username + ":" + password);
    const header = {
      Authorization: basicAuth
    };
    const { data: token } = await http.post(
      apiEndpoint,
      {},
      { headers: header }
    );
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("username", username);
    /*********************************** REMOVE IN PROD  **************************/
    sessionStorage.setItem("header", basicAuth);
  }
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
}

export function getCurrentUser() {
  console.log("in get user", sessionStorage.getItem("username"));
  return sessionStorage.getItem("username");
}

export function getAuthHeader() {
  const token = sessionStorage.getItem("token");
  const header = "JSESSIONID=" + token + ",CLIENT_KEY=" + clientKey;
  if (token) return header;
  return undefined;
}

export function getAuthHeader1() {
  const header = sessionStorage.getItem("header");
  if (header) return header;
  return undefined;
}

export default {
  login,
  logout,
  getCurrentUser,
  getAuthHeader,
  getAuthHeader1
};
