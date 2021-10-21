import http from "./httpService";

export async function getUser(username) {
  return http.get(http.apiUrl() + "/users/" + username);
}

export async function getUsers() {
  return http.get(http.apiUrl() + "/users");
}

export async function createUser(body) {
  return http.post(http.apiUrl() + "/users", body);
}

export async function updateUserProjectRole(projectid, username, body) {
  return http.put(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectid) +
      "/users/" +
      encodeURIComponent(username),
    body
  );
}

export async function deleteUserProjectRole(projectid, username) {
  return http.delete(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectid) +
      "/users/" +
      encodeURIComponent(username)
  );
}

export async function updateUser(username, body) {
  return http.put(
    http.apiUrl() + "/users/" + encodeURIComponent(username),
    body
  );
}

export async function deleteUser(username) {
  return http.delete(http.apiUrl() + "/users/" + encodeURIComponent(username));
}

export async function getUserInfo() {
  return http.get(http.apiUrl() + "/userinfo");
}
