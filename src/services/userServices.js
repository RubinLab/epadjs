import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export async function getUser(username) {
  return http.get(apiUrl + "/users/" + username);
}

export async function getUsers() {
  return http.get(apiUrl + "/users");
}

export async function createUser(body) {
  return http.post(apiUrl + "/users", body);
}

export async function updateUserProjectRole(projectid, username, body) {
  return http.put(
    apiUrl + "/projects/" + encodeURIComponent(projectid) + "/users/" + encodeURIComponent(username),
    body
  );
}

export async function deleteUserProjectRole(projectid, username) {
  return http.delete(apiUrl + "/projects/" + encodeURIComponent(projectid) + "/users/" + encodeURIComponent(username));
}

export async function updateUser(username, body) {
  return http.put(apiUrl + "/users/" + encodeURIComponent(username), body);
}

export async function deleteUser(username) {
  return http.delete(apiUrl + "/users/" + encodeURIComponent(username));
}

export async function getUserInfo() {
  return http.get(apiUrl + "/userinfo");
}
