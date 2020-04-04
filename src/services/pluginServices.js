import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

export function getPlugins() {
  return http.get(apiUrl + "/plugins");
}
export function getOnePlugin(plugindbid) {
  return http.get(apiUrl + "/plugins/" + plugindbid);
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
export function editPlugin(pluginform) {
  return http.post(apiUrl + "/plugins/edit", pluginform);
}

export function saveDefaultParameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/default/addnew",
    parametersform
  );
}
export function deleteOneDefaultParameter(parameterdbid) {
  return http.delete(apiUrl + "/plugins/parameters/default/" + parameterdbid);
}
export function editDefaultparameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/default/edit/",
    parametersform
  );
}
export function getDefaultParameter(plugindbid) {
  return http.get(apiUrl + "/plugins/parameters/default/" + plugindbid);
}

export function getDockerImages() {
  return http.get(apiUrl + "/plugins/docker/images");
}

//pluhin trigger section
export function getAnnotationTemplates() {
  return http.get(apiUrl + "/plugins/annotation/templates");
}
export function getAnnotationProjects() {
  return http.get(apiUrl + "/plugins/annotation/projects");
}
//plugin trigger section ends
