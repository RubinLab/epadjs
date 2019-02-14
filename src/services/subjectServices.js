import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSubjects(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/subjects/");
}
