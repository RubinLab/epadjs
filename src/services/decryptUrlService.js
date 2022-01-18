import http from "./httpService";

export function decryptAndGrantAccess(args) {
  return http.get(http.apiUrl() + "/decryptandgrantaccess?arg=" + args);
}

export function decryptAndAdd(args) {
  return http.put(http.apiUrl() + "/decryptandadd?arg=" + args);
}
