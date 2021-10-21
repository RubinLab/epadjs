import http from "./httpService";

export function decrypt(args) {
  return http.get(http.apiUrl() + "/decrypt?arg=" + args);
}

export function decryptAndAdd(args) {
  return http.put(http.apiUrl() + "/decryptandadd?arg=" + args);
}
