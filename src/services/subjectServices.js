import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export function getSubjects(projectId) {
  if (mode === "lite") {
    projectId = "lite";
    return http.get(apiUrl + "/projects/" + projectId + "/subjects");
  } else return http.get(apiUrl + "/projects/" + projectId + "/subjects");
}

export function downloadSubjects(projectID, body) {
  const pid = projectID || "lite";
  const url =
    apiUrl +
    "/projects/" +
    pid +
    "/subjects/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function deleteSubject(subject, delSys) {
  let { patientID, projectID } = subject;
  patientID = patientID ? patientID : subject.subjectID;
  const url = apiUrl + `/projects/${projectID}/subjects/${patientID}${delSys}`;
  return http.delete(url);
}

export function saveSubject(projectID, subjectAbr, subjectName) {
  const body = { name: subjectName };
  return http.put(
    apiUrl + "/projects/" + projectID + "/subjects/" + subjectAbr,
    body
  );
}

export function uploadFileToSubject(formData, config, subject) {
  let { subjectID, projectID } = subject;
  subjectID = subjectID ? subjectID : subject.patientID;
  projectID = projectID || "lite";
  const url = `${apiUrl}/projects/${projectID}/subjects/${subjectID}/files`;
  return http.post(url, formData, config);
}

export function getAllSubjects() {
  return http.get(apiUrl + "/subjects");
}

export function addSubjectToProject(projectID, subjectID, sourceProject) {
  return http.put(`${apiUrl}/projects/${projectID}/subjects/${subjectID}?from=${sourceProject}`);
}

export function getSubject(projectID, subjectID) {
  return http.get(`${apiUrl}/projects/${projectID}/subjects/${subjectID}`);
}

export function getAimsOfSubject(projectID, subjectID) {
  return http.get(
    `${apiUrl}/projects/${projectID}/subjects/${subjectID}/aims?longitudinal_ref=true`
  );
}
