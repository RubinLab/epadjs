import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export function getPlugins() {
  return http.get(apiUrl + "/plugins");
}

export function getPluginsWithProject() {
  return http.get(apiUrl + "/pluginswithproject");
}

export function getTools() {
  return http.get(apiUrl + "/plugins");
}

export function deleteTool() {
  return http.delete(apiUrl + "/plugins");
}
