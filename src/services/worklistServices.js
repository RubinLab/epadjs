import http from "./httpService";
import { apiUrl } from "../config.json";

export function getWorklists(userName) {
  return http.get(apiUrl + "/users/" + userName + "/worklists/");
}

export function deleteWorklist(userName, id) {
  return http.delete(apiUrl + "/users/" + userName + "/worklists/" + id);
}
