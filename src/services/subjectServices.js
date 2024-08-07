import http from "./httpService";

export function getSubjects(projectId) {
  const apiUrl = http.apiUrl();
  if (http.mode() === "lite") {
    projectId = "lite";
    return http.get(
      apiUrl + "/projects/" + encodeURIComponent(projectId) + "/subjects"
    );
  } else
    return http.get(
      apiUrl + "/projects/" + encodeURIComponent(projectId) + "/subjects"
    );
}

export function downloadSubjects(projectID, body) {
  const pid = encodeURIComponent(projectID) || "lite";
  const url =
    http.apiUrl() +
    "/projects/" +
    pid +
    "/subjects/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function deleteSubject(subject, delSys) {
  let { patientID, projectID } = subject;
  patientID = patientID ? patientID : subject.subjectID;
  const url =
    http.apiUrl() +
    `/projects/${encodeURIComponent(projectID)}/subjects/${encodeURIComponent(
      patientID
    )}${delSys}`;
  return http.delete(url);
}

export function saveSubject(projectID, subjectAbr, subjectName) {
  const body = { name: subjectName };
  return http.put(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/subjects/" +
      subjectAbr,
    body
  );
}

export function uploadFileToSubject(formData, config, subject) {
  let { subjectID, projectID } = subject;
  subjectID = subjectID ? subjectID : subject.patientID;
  projectID = projectID || "lite";
  const url = `${http.apiUrl()}/projects/${encodeURIComponent(
    projectID
  )}/subjects/${encodeURIComponent(subjectID)}/files`;
  return http.post(url, formData, config);
}

export function getAllSubjects() {
  return http.get(http.apiUrl() + "/subjects");
}

export function addSubjectToProject(projectID, subjectID, sourceProject) {
  return http.put(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/subjects/${encodeURIComponent(subjectID)}?from=${sourceProject}`
  );
}

export function getSubject(projectID, subjectID) {
  return http.get(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/subjects/${encodeURIComponent(subjectID)}`
  );
}

export function getAimsOfSubject(projectID, subjectID) {
  return http.get(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/subjects/${encodeURIComponent(subjectID)}/aims?longitudinal_ref=true`
  );
}
