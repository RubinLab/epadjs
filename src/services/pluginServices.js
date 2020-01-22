import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export async function getPlugins() {
  return http.get(apiUrl + "/plugins");
}

export async function getPluginsWithProject() {
  return http.get(apiUrl + "/pluginswithproject");
}

export async function getTools() {
  return http.get(apiUrl + "/plugins");
}

export async function deleteTool() {
  return http.delete(apiUrl + "/plugins");
}
