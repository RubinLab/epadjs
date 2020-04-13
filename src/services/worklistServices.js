import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export function getWorklistsOfCreator() {
  return http.get(apiUrl + "/worklists");
}

// TODO update /worklists/:w/users/:u
export function getWorklistsOfAssignee(userName) {
  return http.get(apiUrl + "/users/" + userName + "/worklists");
}

export function deleteWorklist(worklistId) {
  return http.delete(apiUrl + "/worklists/" + worklistId);
}

export function saveWorklist(
  worklistId,
  name,
  assignees,
  description,
  duedate,
  requirements
) {
  return http.post(apiUrl + "/worklists", {
    worklistId,
    name,
    assignees,
    description,
    duedate,
    requirements
  });
}

export function updateWorklistAssignee(user, id, body) {
  return http.put(apiUrl + "/worklists/" + id + "/users/" + user, body);
}

export function addWorklistRequirement(worklist, body) {
  return http.post(apiUrl + "/worklists/" + worklist + "/requirements", body);
}

export function deleteWorklistRequirement(worklist, requirement) {
  return http.delete(
    apiUrl + "/worklists/" + worklist + "/requirements/" + requirement
  );
}

export function updateWorklist(id, body) {
  return http.put(apiUrl + "/worklists/" + id, body);
}

export function getStudiesOfWorklist(user, id) {
  return http.get(apiUrl + "/worklists/" + id + "/users/" + user + "/subjects");
  // "/subjects/?annotationCount=true"
}

export function addStudyToWorklist(
  worklistId,
  projectID,
  patientID,
  studyUID,
  body
) {
  return http.post(
    apiUrl +
      "/worklists/" +
      worklistId +
      "/projects/" +
      projectID +
      "/subjects/" +
      patientID +
      "/studies/" +
      studyUID,
    body
  );
}

export function addSubjectToWorklist(worklistId, projectID, patientID, body) {
  return http.post(
    apiUrl +
      "/worklists/" +
      worklistId +
      "/projects/" +
      projectID +
      "/subjects/" +
      patientID,
    body
  );
}

export function deleteStudyFromWorklist(worklist, data) {
  return http.delete(apiUrl + "/worklists/" + worklist + "/studies", { data });
}

export function getWorklistProgress(worklist) {
  return http.get(apiUrl + "/worklists/" + worklist + "/progress");
}
