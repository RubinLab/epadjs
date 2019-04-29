import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSubjects(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/subjects/");
}

export function downloadSubject(subject) {
  return http.get(
    apiUrl +
      "/projects/" +
      subject.projectID +
      "/subjects/" +
      subject.patientID +
      "format=stream&includeAims=true"
  );
}
