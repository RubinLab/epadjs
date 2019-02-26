import http from "./httpService";
import { apiUrl } from "../config.json";

export async function getTemplates(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/templates/");
}
