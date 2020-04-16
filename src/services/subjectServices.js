import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export function getSubjects(projectId) {
  if (mode === "lite") {
    projectId = "lite";
    return http.get(apiUrl + "/projects/" + projectId + "/subjects");
  } else return http.get(apiUrl + "/projects/" + projectId + "/subjects");
}

export function downloadSubjects(subject) {
  const subjectID = subject.subjectID || subject.patientID;
  const url =
    apiUrl +
    "/projects/" +
    subject.projectID +
    "/subjects/" +
    subjectID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}

export function deleteSubject(subject) {
  if (mode === "lite") {
    const url = apiUrl + "/projects/lite/subjects/" + subject.patientID;
    return http.delete(url);
  }
}

export function saveSubject(projectID, subjectAbr, subjectName) {
  // http://epad-dev8.stanford.edu:8080/epad/v2/projects/test1id/subjects/test?subjectName=test
  return http.put(
    apiUrl +
      "/projects/" +
      projectID +
      "/subjects/" +
      subjectAbr +
      "?subjectName=" +
      subjectName
  );
}

export function uploadFile(formData, config, projectID, subject) {
  if (mode === "lite") {
    return http.post(`${apiUrl}/projects/lite/subjects/${subject}/files`, formData, config);
  } else {
    const url =
    `${apiUrl}/projects/${projectID}/subjects/${subject}/files`;
    return http.post(url, formData, config);
  }
}