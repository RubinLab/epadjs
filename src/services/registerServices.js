import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

// export function getRegisteredServer(email,hostname) {

//   return http.get(apiUrl + "/register/" + email + "/hostname/" + hostname);
// }

export function registerServerForAppKey(registerform) {
  return http.post(apiUrl + "/register", registerform);
}
