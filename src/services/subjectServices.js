import http from "./httpService";
import { isLite, apiUrl, epadws } from "../config.json";

export function getSubjects(projectId) {
  if (isLite) {
    projectId = "lite";
    return http.get(epadws + "/projects/" + projectId + "/subjects");
  } else return http.get(apiUrl + "/projects/" + projectId + "/subjects/");
}

export function downloadSubjects(subject) {
  const url =
    apiUrl +
    "/projects/" +
    subject.projectID +
    "/subjects/" +
    subject.subjectID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}
