import http from "./httpService";

// export function getPlugins() {
//   // ok
//   return http.get(apiUrl + "/plugins");
// }
export function getOnePlugin(plugindbid) {
  // "/plugins/" + plugindbid)
  return http.get(http.apiUrl() + "/plugins/" + encodeURIComponent(plugindbid));
}
export function getPluginsWithProject() {
  return http.get(http.apiUrl() + "/pluginsprojects"); // /pluginswithproject
}

export function addPluginsToQueue(queueObj) {
  // "/plugins/queue/add", queueObj
  return http.post(http.apiUrl() + "/pluginqueue", queueObj);
}

export function getTools() {
  return http.get(http.apiUrl() + "/plugins");
}

export function updateProjectsForPlugin(pluginid, projectids) {
  // "/plugins/" + pluginid + "/projects/", projectids
  return http.put(
    http.apiUrl() + "/plugins/" + encodeURIComponent(pluginid) + "/projects/",
    projectids
  );
}

export function updateTemplatesForPlugin(pluginid, templateids) {
  // "/plugins/" + pluginid + "/templates/", templateids
  return http.put(
    http.apiUrl() + "/plugins/" + encodeURIComponent(pluginid) + "/templates/",
    templateids
  );
}

export function updateStatusQueueProcess(queueid, tostatus) {
  return http.put(
    http.apiUrl() +
      "/plugins/queue/update/" +
      encodeURIComponent(queueid) +
      "/status/" +
      tostatus
  );
}

export function downloadPluginResult(queueObj) {
  // "/plugins/download/queue/result", queueObj
  return http.post(http.apiUrl() + "/pluginqueue/download", queueObj, {
    responseType: "blob",
  });
}
export function runPluginsQueue(queueObj) {
  //  "/plugins/queue/run", queueObj
  return http.post(http.apiUrl() + "/pluginqueue/run", queueObj);
}
export function stopPluginsQueue(queueObj) {
  //  "/plugins/queue/stop", queueObj
  return http.post(http.apiUrl() + "/pluginqueue/stop", queueObj);
}
export function deletePlugin(pluginid) {
  // "/plugins", pluginid
  return http.post(http.apiUrl() + "/plugins/delete", pluginid);
}
export function savePlugin(pluginform) {
  // "/plugins/addnew", pluginform
  return http.post(http.apiUrl() + "/plugins", pluginform);
}
export function editPlugin(pluginform) {
  // ok
  return http.post(http.apiUrl() + "/plugins/edit", pluginform);
}

export function saveDefaultParameter(parametersform) {
  //  http.apiUrl() + "/plugins/parameters/default/addnew",parametersform
  return http.post(http.apiUrl() + "/plugindefaultparameters", parametersform);
}
export function saveProjectParameter(parametersform) {
  //  http.apiUrl() + "/plugins/parameters/project/addnew",parametersform
  return http.post(http.apiUrl() + "/pluginprojectparameters", parametersform);
}
export function saveTemplateParameter(parametersform) {
  // http.apiUrl() + "/plugins/parameters/template/addnew",parametersform
  return http.post(http.apiUrl() + "/plugintemplateparameters", parametersform);
}
// delete section
export function deleteTool() {
  return http.delete(http.apiUrl() + "/plugins");
}
export function deleteOneDefaultParameter(parameterdbid) {
  //  "/plugins/parameters/default/" + parameterdbid
  return http.delete(
    http.apiUrl() +
      "/pluginparameters/" +
      encodeURIComponent(parameterdbid) +
      "/default"
  );
}
export function deleteOneProjectParameter(parameterdbid) {
  // "/plugins/parameters/project/" + parameterdbid
  return http.delete(
    http.apiUrl() +
      "/pluginparameters/" +
      encodeURIComponent(parameterdbid) +
      "/project"
  );
}
export function deleteOneTemplateParameter(parameterdbid) {
  // "/plugins/parameters/template/" + parameterdbid
  return http.delete(
    http.apiUrl() +
      "/pluginparameters/" +
      encodeURIComponent(parameterdbid) +
      "/template"
  );
}
export function deleteFromPluginQueue(queuedbids) {
  // "/plugins/queue/delete", queuedbids
  return http.post(http.apiUrl() + "/pluginqueue/delete", queuedbids);
}
// delete section
export function editDefaultparameter(parametersform) {
  //   http.apiUrl() + "/plugins/parameters/default/edit/",parametersform
  return http.post(
    http.apiUrl() + "/plugindefaultparameters/edit",
    parametersform
  );
}
export function editProjectParameter(parametersform) {
  //    http.apiUrl() + "/plugins/parameters/project/edit/",parametersform
  return http.post(
    http.apiUrl() + "/pluginprojectparameters/edit",
    parametersform
  );
}
export function editTemplateParameter(parametersform) {
  //  http.apiUrl() + "/plugins/parameters/template/edit/",parametersform
  return http.post(
    http.apiUrl() + "/plugintemplateparameters/edit",
    parametersform
  );
}

export function getPluginsForProject(projectid) {
  return http.get(
    http.apiUrl() + "/projects/" + encodeURIComponent(projectid) + "/plugins"
  ); // "/plugins/project/" + projectid
}
export function getPluginsQueue() {
  //  "/plugins/queue/"
  return http.get(http.apiUrl() + "/pluginqueue");
}
export function getDefaultParameter(plugindbid) {
  // "/plugins/parameters/default/" + plugindbid
  return http.get(
    http.apiUrl() +
      "/plugins/" +
      encodeURIComponent(plugindbid) +
      "/defaultparameters"
  );
}

export function getProjectParameter(plugindbid, projectdbid) {
  // "/plugins/parameters/project/" + plugindbid + "/" + projectdbid
  return http.get(
    http.apiUrl() +
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
    http.apiUrl() +
      "/plugins/" +
      encodeURIComponent(plugindbid) +
      "/template/" +
      encodeURIComponent(templatedbid) +
      "/templateparameters"
  );
}
export function getContainerLog(containerid) {
  return http.get(
    http.apiUrl() + "/container/" + encodeURIComponent(containerid),
    {
      responseType: "stream",
    }
  );
}

export function getPluginParentsInQueue(selectedQueueId) {
  return http.get(
    http.apiUrl() + "/pluginsubqueue/"+ encodeURIComponent(selectedQueueId)
  ); 
}

export function insertPluginSubqueue(subQueueObject) {
  return http.post(
    http.apiUrl() + "/pluginsubqueue",
    subQueueObject
  );
}

export function deletePluginSubqueue(id) {
  // "/plugins/parameters/template/" + parameterdbid
  return http.delete(
    http.apiUrl() +
      "/pluginsubqueue/" +
      encodeURIComponent(id)
  );
}

export function pluginCopyAimsBetweenPlugins(fromid,toid) {
  // "/plugins/parameters/template/" + parameterdbid
  return http.get(
    http.apiUrl() +
      "/pluginsubqueue/" +
      encodeURIComponent(fromid) +
      "/" + 
      encodeURIComponent(toid) 
  );
}

//not used remove if everything works correctly
// export function stopContainerLog(containerobj) {
//   return http.post(http.apiUrl() + "/container/stop/", containerobj);
// }
//plugin trigger section
// export function getAnnotationTemplates() {
//   return http.get(http.apiUrl() + "/pluginsannotationstemplates"); // /plugins/annotation/templates
// }
// export function getUniqueProjectsIfAnnotationExist() {
//   return http.get(http.apiUrl() + "/pluginsannotationsprojects"); // /plugins/annotation/projects
// }
//plugin trigger section ends
