import http from "./httpService";
import { isLite, apiUrl } from "../config.json";

export function getWorklistsOfCreator() {
  return http.get(apiUrl + "/worklists");
}

export function getWorklistsOfAssignee(userName) {
  return http.get(apiUrl + "/users/" + userName + "/worklists");
}

export function deleteWorklist(user, worklistId) {
  return http.delete(apiUrl + "/users/" + user + "/worklists/" + worklistId);
}

export function saveWorklist(
  worklistId,
  worklistName,
  assignees,
  description,
  dueDate
) {
  console.log("--- in worklist service---");
  console.log(worklistId, worklistName, assignees, description, dueDate);
  return http.post(apiUrl + "/worklists", {
    worklistId,
    worklistName,
    assignees,
    description,
    dueDate
  });
}

export function updateWorklistAssignee(user, id, body) {
  return http.put(apiUrl + "/users/" + user + "/worklists/" + id, body);
}

export function updateWorklist(id, body) {
  return http.put(apiUrl + "/worklists/" + id, body);
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
