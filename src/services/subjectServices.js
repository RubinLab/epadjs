import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSubjects(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/subjects/");
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
