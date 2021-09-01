import http from "./httpService";

export function scanFolder(projectId = "lite") {
  return http.post(
    http.apiUrl() + "/projects/" + encodeURIComponent(projectId) + "/scanfolder"
  );
}
