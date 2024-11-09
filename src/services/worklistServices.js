import http from "./httpService";

export function getWorklistsOfCreator(addValidAssignees) {
  return http.get(http.apiUrl() + "/worklists" + (addValidAssignees ? "?addValidAssignees=true": ""));
}

// TODO update /worklists/:w/users/:u
export function getWorklistsOfAssignee(userName) {
  return http.get(
    http.apiUrl() + "/users/" + encodeURIComponent(userName) + "/worklists"
  );
}

export function deleteWorklist(worklistId) {
  return http.delete(
    http.apiUrl() + "/worklists/" + encodeURIComponent(worklistId)
  );
}

export function saveWorklist(
  worklistId,
  name,
  assignees,
  description,
  duedate,
  requirements
) {
  return http.post(http.apiUrl() + "/worklists", {
    worklistId,
    name,
    assignees,
    description,
    duedate,
    requirements,
  });
}

export function updateWorklistAssignee(user, id, body) {
  return http.put(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(id) +
    "/users/" +
    encodeURIComponent(user),
    body
  );
}

export function addWorklistRequirement(worklist, body) {
  return http.post(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklist) +
    "/requirements",
    body
  );
}

export function deleteWorklistRequirement(worklist, requirement) {
  return http.delete(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklist) +
    "/requirements/" +
    requirement
  );
}

export function updateWorklist(id, body) {
  return http.put(http.apiUrl() + "/worklists/" + encodeURIComponent(id), body);
}

export function getStudiesOfWorklist(user, id) {
  return http.get(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(id) +
    "/users/" +
    encodeURIComponent(user) +
    "/studies"
  );
  // "/subjects/?annotationCount=true"
}

export function addStudyToWorklist(
  worklistId,
  projectID,
  patientID,
  studyUID,
  body
) {
  return http.put(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklistId) +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(patientID) +
    "/studies/" +
    encodeURIComponent(studyUID),
    body
  );
}

export function addStudiesToWorklist(
  worklistId, arr
) {
  const promises = [];
  arr.forEach(el => {
    const { projectID, patientID, studyUID, body } = el;
    const promise = http.put(http.apiUrl() +
      "/worklists/" +
      encodeURIComponent(worklistId) +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/subjects/" +
      encodeURIComponent(patientID) +
      "/studies/" +
      encodeURIComponent(studyUID),
      body);
    promises.push(promise);
  }
  )
  return promises;
}

export function addSubjectToWorklist(worklistId, projectID, patientID, body) {
  return http.put(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklistId) +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(patientID),
    body
  );
}

export function addSubjectsToWorklist(
  worklistId, arr
) {
  const promises = [];
  arr.forEach(el => {
    const { projectID, patientID, body } = el;
    const promise = http.put(http.apiUrl() +
      "/worklists/" +
      encodeURIComponent(worklistId) +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/subjects/" +
      encodeURIComponent(patientID),
      body);
    promises.push(promise);
  }
  )
  return promises;
}

export function deleteStudyFromWorklist(worklist, data) {
  return http.delete(
    http.apiUrl() + "/worklists/" + encodeURIComponent(worklist) + "/studies",
    { data }
  );
}

export function getWorklistProgress(worklist) {
  return http.get(
    http.apiUrl() + "/worklists/" + encodeURIComponent(worklist) + "/progress"
  );
}

export function updateWorklistProgressManually(
  worklist,
  project,
  subject,
  study,
  annotationStatus
) {
  return http.put(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklist) +
    "/projects/" +
    encodeURIComponent(project) +
    "/subjects/" +
    encodeURIComponent(subject) +
    "/studies/" +
    encodeURIComponent(study) +
    `?annotationStatus=` +
    annotationStatus
  );
}

export function addAimsToWorklist(worklist, body) {
  return http.post(
    http.apiUrl() +
    "/worklists/" +
    encodeURIComponent(worklist) +
    "/aims",
    body
  );
}