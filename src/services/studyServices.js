import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
export function getStudies(projectId, subjectId) {
  if (mode === "lite")
    return http.get(
      apiUrl + "/projects/lite/subjects/" + subjectId + "/studies?filterDSO=true"
    );
  else
    return http.get(
      apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies?filterDSO=true"
    );
}

export function downloadStudies(study) {
  const url =
    apiUrl +
    "/projects/" +
    study.projectID +
    "/subjects/" +
    study.patientID +
    "/studies/" +
    study.studyUID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}

export function deleteStudy(study, delSys ) {
  const { projectID, patientID, studyUID } = study;
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    patientID +
    "/studies/" +
    studyUID + delSys;
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

export function saveStudy(projectID, subjectID, abbreviation, description) {
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    subjectID +
    "/studies/" +
    abbreviation +
    "?description=" +
    description;
  return http.put(url);
}

export function uploadFileToStudy(formData, config, study) {
  let { projectID, subjectID, studyUID } = study;
  subjectID = subjectID ? subjectID : study.patientID;
  const url = `${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}/files`;
  return http.post(url, formData, config);
}

export function addStudyToProject(projectID, subjectID, studyUID) {
  return http.put(`${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}`);
}