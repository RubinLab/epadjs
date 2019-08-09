import http from "./httpService";
import { isLite, apiUrl, apiUrlV1 } from "../config.json";

export function getProjects() {
  return http.get(apiUrl + "/projects/");
}

export function deleteProject(projectId) {
  return http.delete(apiUrl + "/projects/" + projectId);
}

export function saveProject(
  projectName,
  projectDescription,
  defaultTemplate,
  id,
  user,
  type
) {
  return http.post(
    apiUrl +
      "/projects/" +
      id +
      "?/username=" +
      user +
      "&projectName=" +
      projectName +
      "&projectDescription=" +
      projectDescription +
      "&type=" +
      type,
    { projectDescription, defaultTemplate }
  );
}

export function updateProject(id, projectName, projectDescription, type) {
  return http.put(
    apiUrl +
      "/projects/" +
      id +
      "?projectName=" +
      projectName +
      "&description=" +
      projectDescription +
      "&type=" +
      type
  );
}

export function getProjectUsers(id) {
  return http.get(apiUrl + "/projects/" + id + "/users/");
}

export function editUserRole(id, user, role) {
  return role
    ? http.put(apiUrl + "/projects/" + id + "/users/" + user + "?role=" + role)
    : http.delete(apiUrl + "/projects/" + id + "/users/" + user);
}

export function downloadProjects(projectID) {
  return http.get(
    apiUrl + "/projects/" + projectID + "?format=stream&includeAims=true"
  );
}

export function uploadFile(formData, config, projectID, username) {
  if (isLite) {
    return http.post(apiUrl + "/projects/lite/files", formData, config);
  } else {
    const url =
      apiUrlV1 +
      "/rest/upload?projectID=" +
      projectID +
      "&username=" +
      username;
    console.log("url is", url);
    return http.post(url, formData, config);
  }
}
