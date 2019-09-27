import http from "./httpService";
import { apiUrl } from "../config.json";

export async function getUser(username) {
  return http.get(apiUrl + "/users/" + username);
}

export async function getUsers() {
  return http.get(apiUrl + "/users");
}

export async function createUser(username, firstname, lastname, email) {
  return http.post(apiUrl + "/users", {
    username,
    firstname,
    lastname,
    email
  });
}

export async function updateUserProjectRole(projectid, username, body) {
  return http.put(
    apiUrl + "/projects/" + projectid + "/users/" + username,
    body
  );
}

export async function updateUser(username, body) {
  return http.put(apiUrl + "/users/" + username, body);
}

export async function deleteUser(username) {
  return http.delete(apiUrl + "/users/" + username);
}
