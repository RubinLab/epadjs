import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export async function getPlugins(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/plugins");
}
