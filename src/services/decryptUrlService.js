import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export function decrypt(args) {
  return http.get(apiUrl + "/decrypt?arg=" + args);
}

export function decryptAndAdd(args) {
  return http.put(apiUrl + "/decryptandadd?arg=" + args);
}
