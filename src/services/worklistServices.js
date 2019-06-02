import http from "./httpService";
import { apiUrl } from "../config.json";

export function getWorklists(userName) {
  return http.get(apiUrl + "/users/" + userName + "/worklists/");
}

export function deleteWorklist(userName, id) {
  return http.delete(apiUrl + "/users/" + userName + "/worklists/" + id);
}

export function saveWorklist(user, id, desc, name) {
  return http.post(
    apiUrl +
      "/users/" +
      user +
      "/worklists/" +
      id +
      "?description=" +
      desc +
      "&name=" +
      name
  );
}

export function updateWorklist(user, id) {
  return http.put(
    apiUrl + "/users/" + user + "/worklists/" + id + "?user=" + user
  );
}
