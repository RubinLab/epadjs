import http from "./httpService";
import { isLite, apiUrl } from "../config.json";

export function getWorklistsOfCreator() {
  return http.get(apiUrl + "/worklists");
}

// TODO update /worklists/:w/users/:u
export function getWorklistsOfAssignee(userName) {
  return http.get(apiUrl + "/users/" + userName + "/worklists");
}

// TODO update /worklists/:w
export function deleteWorklist(worklistId) {
  return http.delete(apiUrl + "/worklists/" + worklistId);
}

export function saveWorklist(
  worklistId,
  worklistName,
  assignees,
  description,
  dueDate
) {
  return http.post(apiUrl + "/worklists", {
    worklistId,
    worklistName,
    assignees,
    description,
    dueDate
  });
}

// TODO update /worklists/:w/users/:u, body
export function updateWorklistAssignee(user, id, body) {
  return http.put(apiUrl + "/worklists/" + id + "/users/" + user, body);
}

export function updateWorklist(id, body) {
  return http.put(apiUrl + "/worklists/" + id, body);
}

// TODO update /worklists/:w/users/:u
export function getWorklistOfAssignee(user, id) {
  // /users/admin/worklists/tes5/subjects/?annotationCount=true
  return http.get(
    apiUrl +
      "/worklists/" +
      id +
      "/users/" +
      user +
      // "/subjects/?annotationCount=true"
      "/subjects"
  );
}

export function addStudyToWorklist(worklistId, projectID, patientID, studyUID) {
  // '/worklists/:worklist/projects/:project/subjects/:subject/studies/:study',
  return http.post(
    apiUrl +
      "/worklists/" +
      worklistId +
      "/projects/" +
      projectID +
      "/subjects/" +
      patientID +
      "/studies/" +
      studyUID
  );
}

export function addSubjectToWorklist(worklistId, projectID, patientID) {
  // '/worklists/:worklist/projects/:project/subjects/:subject',
  return http.post(
    apiUrl +
      "/worklists/" +
      worklistId +
      "/projects/" +
      projectID +
      "/subjects/" +
      patientID
  );
}
