import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
export function scanFolder(projectId = "lite") {
  return http.post(apiUrl + "/projects/" + encodeURIComponent(projectId) + "/scanfolder");
}
