import http from "./httpService";
// const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export function getProjects() {
  return http.get(http.apiUrl() + "/projects");
}
//cavit
export function getProjectsWithPkAsId() {
  return http.get(http.apiUrl() + "/projectswithpkasid");
}

//cavit

export function deleteProject(projectId) {
  return http.delete(
    http.apiUrl() + "/projects/" + encodeURIComponent(projectId)
  );
}

export function saveProject(
  projectName,
  projectDescription,
  defaultTemplate,
  projectId,
  userName,
  type
) {
  return http.post(http.apiUrl() + "/projects", {
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
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(id) +
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
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(id) +
      "?defaultTemplate=" +
      defaultTemplate
  );
}

export function getProjectUsers(id) {
  return http.get(
    http.apiUrl() + "/projects/" + encodeURIComponent(id) + "/users"
  );
}

export function editUserRole(id, user, role) {
  return role
    ? http.put(
        http.apiUrl() +
          "/projects/" +
          encodeURIComponent(id) +
          "/users/" +
          user,
        { role }
      )
    : http.delete(
        http.apiUrl() + "/projects/" + encodeURIComponent(id) + "/users/" + user
      );
}

export function downloadProjects(projectID) {
  const pid = mode === "lite" ? "lite" : projectID;
  return http.get(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(pid) +
      "?format=stream&includeAims=true"
  );
}

export function uploadFileToProject(formData, config, projectID) {
  if (mode === "lite") {
    return http.post(http.apiUrl() + "/projects/lite/files", formData, config);
  } else {
    const url =
      http.apiUrl() + "/projects/" + encodeURIComponent(projectID) + "/files";
    return http.post(url, formData, config);
  }
}

export function getProject(projectID) {
  return http.get(http.apiUrl() + "/projects/" + encodeURIComponent(projectID));
}

export function getStudies(projectID) {
  return http.get(
    http.apiUrl() + "/projects/" + encodeURIComponent(projectID) + "/studies"
  );
}
