import http from "./httpService";
import { isLite, apiUrl } from "../config.json";

export function getWorklistsOfCreator() {
  return http.get(
    apiUrl + "/worklists" + "?username=ozge.ikiz.yurtsever@gmail.com"
  );
}

export function getWorklistsOfAssignee(userName) {
  return http.get(
    apiUrl +
      "/users/" +
      userName +
      "/worklists" +
      "?username=ozge.ikiz.yurtsever@gmail.com"
  );
}

export function deleteWorklist(user, worklistId) {
  return http.delete(apiUrl + "/users/" + user + "/worklists/" + worklistId);
}

export function saveWorklist(
  worklistId,
  worklistName,
  userId,
  description,
  dueDate
) {
  return http.post(
    apiUrl +
      "/users/" +
      userId +
      "/worklists" +
      "?username=ozge.ikiz.yurtsever@gmail.com",
    {
      worklistId,
      worklistName,
      userId,
      description,
      dueDate
    }
  );
}

export function updateWorklistAssignee(user, id, body) {
  return http.put(
    apiUrl +
      "/users/" +
      user +
      "/worklists/" +
      id +
      "?username=ozge.ikiz.yurtsever@gmail.com",
    body
  );
}

export function updateWorklist(id, body) {
  return http.put(
    apiUrl + "/worklists/" + id + "?username=ozge.ikiz.yurtsever@gmail.com",
    body
  );
}
export function getWorklist(user, id) {
  // /users/admin/worklists/tes5/subjects/?annotationCount=true
  return http.get(
    apiUrl +
      "/users/" +
      user +
      "/worklists/" +
      id +
      "/subjects/?annotationCount=true"
  );
}
