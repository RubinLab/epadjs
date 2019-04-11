import http from "./httpService";
import { lightweightApi } from "../config.json";

export function getSubjects(projectId) {
  projectId = "lite";
  return http.get(lightweightApi + "/projects/" + projectId + "/subjects");
}
