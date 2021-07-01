import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");

// export function getPlugins() {
//   // ok
//   return http.get(apiUrl + "/plugins");
// }
export function getOnePlugin(plugindbid) {
  // "/plugins/" + plugindbid)
  return http.get(apiUrl + "/plugins/" + encodeURIComponent(plugindbid));
}
export function getPluginsWithProject() {
  return http.get(apiUrl + "/pluginsprojects"); // /pluginswithproject
}

export function addPluginsToQueue(queueObj) {
  // "/plugins/queue/add", queueObj
  return http.post(apiUrl + "/pluginqueue", queueObj);
}

export function getTools() {
  return http.get(apiUrl + "/plugins");
}

export function updateProjectsForPlugin(pluginid, projectids) {
  // "/plugins/" + pluginid + "/projects/", projectids
  return http.put(apiUrl + "/plugins/" + encodeURIComponent(pluginid) + "/projects/", projectids);
}

export function updateTemplatesForPlugin(pluginid, templateids) {
  // "/plugins/" + pluginid + "/templates/", templateids
  return http.put(apiUrl + "/plugins/" + encodeURIComponent(pluginid) + "/templates/", templateids);
}

export function updateStatusQueueProcess(queueid, tostatus) {
  return http.put(
    apiUrl + "/plugins/queue/update/" + encodeURIComponent(queueid) + "/status/" + tostatus
  );
}

export function downloadPluginResult(queueObj) {
  // "/plugins/download/queue/result", queueObj
  return http.post(apiUrl + "/pluginqueue/download", queueObj, {
    responseType: "blob",
  });
}
export function runPluginsQueue(queueObj) {
  //  "/plugins/queue/run", queueObj
  return http.post(apiUrl + "/pluginqueue/run", queueObj);
}
export function stopPluginsQueue(queueObj) {
  //  "/plugins/queue/stop", queueObj
  return http.post(apiUrl + "/pluginqueue/stop", queueObj);
}
export function deletePlugin(pluginid) {
  // "/plugins", pluginid
  return http.post(apiUrl + "/plugins/delete", pluginid);
}
export function savePlugin(pluginform) {
  // "/plugins/addnew", pluginform
  return http.post(apiUrl + "/plugins", pluginform);
}
export function editPlugin(pluginform) {
  // ok
  return http.post(apiUrl + "/plugins/edit", pluginform);
}

export function saveDefaultParameter(parametersform) {
  //  apiUrl + "/plugins/parameters/default/addnew",parametersform
  return http.post(apiUrl + "/plugindefaultparameters", parametersform);
}
export function saveProjectParameter(parametersform) {
  //  apiUrl + "/plugins/parameters/project/addnew",parametersform
  return http.post(apiUrl + "/pluginprojectparameters", parametersform);
}
export function saveTemplateParameter(parametersform) {
  // apiUrl + "/plugins/parameters/template/addnew",parametersform
  return http.post(apiUrl + "/plugintemplateparameters", parametersform);
}
// delete section
export function deleteTool() {
  return http.delete(apiUrl + "/plugins");
}
export function deleteOneDefaultParameter(parameterdbid) {
  //  "/plugins/parameters/default/" + parameterdbid
  return http.delete(
    apiUrl + "/pluginparameters/" + encodeURIComponent(parameterdbid) + "/default"
  );
}
export function deleteOneProjectParameter(parameterdbid) {
  // "/plugins/parameters/project/" + parameterdbid
  return http.delete(
    apiUrl + "/pluginparameters/" + encodeURIComponent(parameterdbid) + "/project"
  );
}
export function deleteOneTemplateParameter(parameterdbid) {
  // "/plugins/parameters/template/" + parameterdbid
  return http.delete(
    apiUrl + "/pluginparameters/" + encodeURIComponent(parameterdbid) + "/template"
  );
}
export function deleteFromPluginQueue(queuedbids) {
  // "/plugins/queue/delete", queuedbids
  return http.post(apiUrl + "/pluginqueue/delete", queuedbids);
}
// delete section
export function editDefaultparameter(parametersform) {
  //   apiUrl + "/plugins/parameters/default/edit/",parametersform
  return http.post(apiUrl + "/plugindefaultparameters/edit", parametersform);
}
export function editProjectParameter(parametersform) {
  //    apiUrl + "/plugins/parameters/project/edit/",parametersform
  return http.post(apiUrl + "/pluginprojectparameters/edit", parametersform);
}
export function editTemplateParameter(parametersform) {
  //  apiUrl + "/plugins/parameters/template/edit/",parametersform
  return http.post(apiUrl + "/plugintemplateparameters/edit", parametersform);
}

export function getPluginsForProject(projectid) {
  return http.get(apiUrl + "/projects/" + encodeURIComponent(projectid) + "/plugins"); // "/plugins/project/" + projectid
}
export function getPluginsQueue() {
  //  "/plugins/queue/"
  return http.get(apiUrl + "/pluginqueue");
}
export function getDefaultParameter(plugindbid) {
  // "/plugins/parameters/default/" + plugindbid
  return http.get(apiUrl + "/plugins/" + encodeURIComponent(plugindbid) + "/defaultparameters");
}

export function getProjectParameter(plugindbid, projectdbid) {
  // "/plugins/parameters/project/" + plugindbid + "/" + projectdbid
  return http.get(
    apiUrl +
      "/plugins/" +
      encodeURIComponent(plugindbid) +
      "/project/" +
      encodeURIComponent(projectdbid) +
      "/projectparameters"
  );
}
export function getTemplateParameter(plugindbid, templatedbid) {
  // "/plugins/parameters/template/" + plugindbid + "/" + templatedbid
  return http.get(
    apiUrl +
      "/plugins/" +
      encodeURIComponent(plugindbid) +
      "/template/" +
      encodeURIComponent(templatedbid) +
      "/templateparameters"
  );
}
export function getContainerLog(containerid) {
  return http.get(apiUrl + "/container/" + encodeURIComponent(containerid), {
    responseType: "stream",
  });
}
//not used remove if everything works correctly
// export function stopContainerLog(containerobj) {
//   return http.post(apiUrl + "/container/stop/", containerobj);
// }
//plugin trigger section
// export function getAnnotationTemplates() {
//   return http.get(apiUrl + "/pluginsannotationstemplates"); // /plugins/annotation/templates
// }
// export function getUniqueProjectsIfAnnotationExist() {
//   return http.get(apiUrl + "/pluginsannotationsprojects"); // /plugins/annotation/projects
// }
//plugin trigger section ends
