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

export function updateProjectsForPlugin(pluginid, projectids) {
  return http.put(apiUrl + "/plugins/" + pluginid + "/projects/", projectids);
}

export function updateTemplatesForPlugin(pluginid, templateids) {
  return http.put(apiUrl + "/plugins/" + pluginid + "/templates/", templateids);
}

export function deletePlugin(pluginid) {
  return http.post(apiUrl + "/plugins", pluginid);
}
export function savePlugin(pluginform) {
  return http.post(apiUrl + "/plugins/addnew", pluginform);
}
