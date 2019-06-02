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

// http://epad-dev8.stanford.edu:8080/epad/v2/users/admin/worklists/idtest4?description=desc%20test4&name=test4
