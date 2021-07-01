import http from './httpService';
const apiUrl = sessionStorage.getItem('apiUrl');

export function getWorklistsOfCreator() {
  return http.get(apiUrl + '/worklists');
}

// TODO update /worklists/:w/users/:u
export function getWorklistsOfAssignee(userName) {
  return http.get(
    apiUrl + '/users/' + encodeURIComponent(userName) + '/worklists'
  );
}

export function deleteWorklist(worklistId) {
  return http.delete(apiUrl + '/worklists/' + encodeURIComponent(worklistId));
}

export function saveWorklist(
  worklistId,
  name,
  assignees,
  description,
  duedate,
  requirements
) {
  return http.post(apiUrl + '/worklists', {
    worklistId,
    name,
    assignees,
    description,
    duedate,
    requirements
  });
}

export function updateWorklistAssignee(user, id, body) {
  return http.put(
    apiUrl +
      '/worklists/' +
      encodeURIComponent(id) +
      '/users/' +
      encodeURIComponent(user),
    body
  );
}

export function addWorklistRequirement(worklist, body) {
  return http.post(
    apiUrl + '/worklists/' + encodeURIComponent(worklist) + '/requirements',
    body
  );
}

export function deleteWorklistRequirement(worklist, requirement) {
  return http.delete(
    apiUrl +
      '/worklists/' +
      encodeURIComponent(worklist) +
      '/requirements/' +
      requirement
  );
}

export function updateWorklist(id, body) {
  return http.put(apiUrl + '/worklists/' + encodeURIComponent(id), body);
}

export function getStudiesOfWorklist(user, id) {
  return http.get(
    apiUrl +
      '/worklists/' +
      encodeURIComponent(id) +
      '/users/' +
      encodeURIComponent(user) +
      '/studies'
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
    apiUrl +
      '/worklists/' +
      encodeURIComponent(worklistId) +
      '/projects/' +
      encodeURIComponent(projectID) +
      '/subjects/' +
      encodeURIComponent(patientID) +
      '/studies/' +
      encodeURIComponent(studyUID),
    body
  );
}

export function addSubjectToWorklist(worklistId, projectID, patientID, body) {
  return http.put(
    apiUrl +
      '/worklists/' +
      encodeURIComponent(worklistId) +
      '/projects/' +
      encodeURIComponent(projectID) +
      '/subjects/' +
      encodeURIComponent(patientID),
    body
  );
}

export function deleteStudyFromWorklist(worklist, data) {
  return http.delete(
    apiUrl + '/worklists/' + encodeURIComponent(worklist) + '/studies',
    { data }
  );
}

export function getWorklistProgress(worklist) {
  return http.get(
    apiUrl + '/worklists/' + encodeURIComponent(worklist) + '/progress'
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
    apiUrl +
      '/worklists/' +
      encodeURIComponent(worklist) +
      '/projects/' +
      encodeURIComponent(project) +
      '/subjects/' +
      encodeURIComponent(subject) +
      '/studies/' +
      encodeURIComponent(study) +
      `?annotationStatus=` +
      annotationStatus
  );
}
