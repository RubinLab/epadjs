import http from "./httpService";

export function getStudies(projectId, subjectId) {
  const apiUrl = http.apiUrl();
  if (http.mode() === "lite")
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        encodeURIComponent(subjectId) +
        "/studies?filterDSO=true"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        encodeURIComponent(projectId) +
        "/subjects/" +
        encodeURIComponent(subjectId) +
        "/studies?filterDSO=true"
    );
}

export function downloadStudies(projectID, body) {
  projectID = projectID || "lite";
  const url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/studies/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function deleteStudy(study, delSys) {
  const { projectID, patientID, studyUID } = study;
  const url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(patientID) +
    "/studies/" +
    encodeURIComponent(studyUID) +
    delSys;
  return http.delete(url);
}

export function getStudyAims(subjectID, studyUID, projectID = "lite") {
  return http.get(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/subjects/" +
      encodeURIComponent(subjectID) +
      "/studies/" +
      encodeURIComponent(studyUID) +
      "/aims"
  );
}

export function saveStudy(projectID, subjectID, studyUid, studyDesc) {
  const url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(subjectID) +
    "/studies";
  const body = { studyUid, studyDesc };
  return http.post(url, body);
}

export function uploadFileToStudy(formData, config, study) {
  let { projectID, subjectID, studyUID } = study;
  subjectID = subjectID ? subjectID : study.patientID;
  projectID = projectID || "lite";
  const url = `${http.apiUrl()}/projects/${encodeURIComponent(
    projectID
  )}/subjects/${encodeURIComponent(subjectID)}/studies/${encodeURIComponent(
    studyUID
  )}/files`;
  return http.post(url, formData, config);
}

export function addStudyToProject(
  projectID,
  subjectID,
  studyUID,
  sourceProject
) {
  return http.put(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/subjects/${encodeURIComponent(subjectID)}/studies/${encodeURIComponent(
      studyUID
    )}?from=${sourceProject}`
  );
}

export function getStudy(projectId, subjectId, studyUID) {
  return http.get(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectId) +
      "/subjects/" +
      encodeURIComponent(subjectId) +
      "/studies/" +
      encodeURIComponent(studyUID)
  );
}
