import http from "./httpService";

// export function getRegisteredServer(email,hostname) {

//   return http.get(apiUrl + "/register/" + email + "/hostname/" + hostname);
// }

export function registerServerForAppKey(registerform) {
  return http.post(http.apiUrl() + "/register", registerform);
}
