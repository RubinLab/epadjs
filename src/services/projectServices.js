import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export function getProjects() {
  return http.get(apiUrl + "/projects");
}
//cavit
export function getProjectsWithPkAsId() {
  return http.get(apiUrl + "/projectswithpkasid");
}

//cavit

export function deleteProject(projectId) {
  return http.delete(apiUrl + "/projects/" + projectId);
}

export function saveProject(
  projectName,
  projectDescription,
  defaultTemplate,
  projectId,
  userName,
  type
) {
  return http.post(apiUrl + "/projects", {
    projectName,
    projectDescription,
    defaultTemplate,
    projectId,
    userName,
    type,
  });
}

export function updateProject(
  id,
  projectName,
  projectDescription,
  type,
  defaultTemplate
) {
  // const body = { id, projectName, projectDescription, type, defaultTemplate };
  // return http.put(apiUrl + "/projects/" + id, body);
  return http.put(
    apiUrl +
      "/projects/" +
      id +
      "?projectName=" +
      projectName +
      "&description=" +
      projectDescription +
      "&type=" +
      type +
      "&defaulttemplate=" +
      defaultTemplate
  );
}

export function updateTemplate(id, defaultTemplate) {
  return http.put(
    apiUrl + "/projects/" + id + "?defaultTemplate=" + defaultTemplate
  );
}

export function getProjectUsers(id) {
  return http.get(apiUrl + "/projects/" + id + "/users");
}

export function editUserRole(id, user, role) {
  return role
    ? http.put(apiUrl + "/projects/" + id + "/users/" + user, { role })
    : http.delete(apiUrl + "/projects/" + id + "/users/" + user);
}

export function downloadProjects(projectID) {
  const pid = mode === "lite" ? "lite" : projectID
  return http.get(
    apiUrl + "/projects/" + pid + "?format=stream&includeAims=true"
  );
}

export function uploadFileToProject(formData, config, projectID) {
  if (mode === "lite") {
    return http.post(apiUrl + "/projects/lite/files", formData, config);
  } else {
    const url = apiUrl + "/projects/" + projectID + "/files";
    return http.post(url, formData, config);
  }
}

export function getProject(projectID) {
  return http.get(apiUrl + "/projects/" + projectID);
}

export function getStudies(projectID) {
  return http.get(apiUrl + "/projects/" + projectID + "/studies");
}
