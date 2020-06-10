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

export function addPluginsToQueue(queueObj) {
  return http.post(apiUrl + "/plugins/queue/add", queueObj);
}

export function getTools() {
  return http.get(apiUrl + "/plugins");
}

export function updateProjectsForPlugin(pluginid, projectids) {
  return http.put(apiUrl + "/plugins/" + pluginid + "/projects/", projectids);
}

export function updateTemplatesForPlugin(pluginid, templateids) {
  return http.put(apiUrl + "/plugins/" + pluginid + "/templates/", templateids);
}

export function updateStatusQueueProcess(queueid, tostatus) {
  return http.put(
    apiUrl + "/plugins/queue/update/" + queueid + "/status/" + tostatus
  );
}

export function downloadPluginResult(queueObj) {
  return http.post(apiUrl + "/plugins/download/queue/result", queueObj, {
    responseType: "blob",
  });
}
export function runPluginsQueue(queueObj) {
  return http.post(apiUrl + "/plugins/queue/run", queueObj);
}
export function stopPluginsQueue(queueObj) {
  return http.post(apiUrl + "/plugins/queue/stop", queueObj);
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
export function saveProjectParameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/project/addnew",
    parametersform
  );
}
export function saveTemplateParameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/template/addnew",
    parametersform
  );
}
// delete section
export function deleteTool() {
  return http.delete(apiUrl + "/plugins");
}
export function deleteOneDefaultParameter(parameterdbid) {
  return http.delete(apiUrl + "/plugins/parameters/default/" + parameterdbid);
}
export function deleteOneProjectParameter(parameterdbid) {
  return http.delete(apiUrl + "/plugins/parameters/project/" + parameterdbid);
}
export function deleteOneTemplateParameter(parameterdbid) {
  return http.delete(apiUrl + "/plugins/parameters/template/" + parameterdbid);
}
export function deleteFromPluginQueue(queuedbids) {
  return http.post(apiUrl + "/plugins/queue/delete", queuedbids);
}
// delete section
export function editDefaultparameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/default/edit/",
    parametersform
  );
}
export function editProjectParameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/project/edit/",
    parametersform
  );
}
export function editTemplateParameter(parametersform) {
  return http.post(
    apiUrl + "/plugins/parameters/template/edit/",
    parametersform
  );
}

export function getPluginsForProject(projectid) {
  return http.get(apiUrl + "/plugins/project/" + projectid);
}
export function getPluginsQueue() {
  return http.get(apiUrl + "/plugins/queue/");
}
export function getDefaultParameter(plugindbid) {
  return http.get(apiUrl + "/plugins/parameters/default/" + plugindbid);
}

export function getProjectParameter(plugindbid, projectdbid) {
  return http.get(
    apiUrl + "/plugins/parameters/project/" + plugindbid + "/" + projectdbid
  );
}
export function getTemplateParameter(plugindbid, templatedbid) {
  return http.get(
    apiUrl + "/plugins/parameters/template/" + plugindbid + "/" + templatedbid
  );
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
