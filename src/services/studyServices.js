import http from "./httpService";
import { apiUrl } from "../config.json";

export function getStudies(projectId, subjectId) {
  return http.get(
    apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies/"
  );
}
