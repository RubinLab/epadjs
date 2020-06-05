import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
export function getStudies(projectId, subjectId) {
  if (mode === "lite")
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        subjectId +
        "/studies?filterDSO=true"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        projectId +
        "/subjects/" +
        subjectId +
        "/studies?filterDSO=true"
    );
}

export function downloadStudies(projectID, body) {
  console.log(body);
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/studies/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function deleteStudy(study, delSys) {
  const { projectID, patientID, studyUID } = study;
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    patientID +
    "/studies/" +
    studyUID +
    delSys;
  return http.delete(url);
}

export function getStudyAims(subjectID, studyUID, projectID = "lite") {
  return http.get(
    apiUrl +
      "/projects/" +
      projectID +
      "/subjects/" +
      subjectID +
      "/studies/" +
      studyUID +
      "/aims"
  );
}

export function saveStudy(projectID, subjectID, studyUid, studyDesc) {
  const url =
    apiUrl + "/projects/" + projectID + "/subjects/" + subjectID + "/studies";
  const body = { studyUid, studyDesc };
  return http.post(url, body);
}

export function uploadFileToStudy(formData, config, study) {
  let { projectID, subjectID, studyUID } = study;
  subjectID = subjectID ? subjectID : study.patientID;
  const url = `${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}/files`;
  return http.post(url, formData, config);
}

export function addStudyToProject(projectID, subjectID, studyUID) {
  return http.put(
    `${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}`
  );
}

export function getStudy(projectId, subjectId, studyUID) {
  return http.get(
    apiUrl +
      "/projects/" +
      projectId +
      "/subjects/" +
      subjectId +
      "/studies/" +
      studyUID
  );
}
