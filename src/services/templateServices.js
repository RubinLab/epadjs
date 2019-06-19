import http from "./httpService";
import { apiUrl, isLite } from "../config.json";

export async function getTemplates(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/templates/");
}

export async function getAllTemplates() {
  return isLite
    ? http.get(apiUrl + "/projects/lite/templates?format=summary")
    : http.get(apiUrl + "/templates/");
}

export function downloadTemplates(tempIDlist, selection) {
  if (isLite) {
    return http.post(apiUrl + "/projects/lite/templates/download", tempIDlist, {
      responseType: "blob"
    });
  }
}
