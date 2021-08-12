import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

// export async function getTemplates(projectId) {
//   return http.get(apiUrl + "/projects/" + projectId + "/templates/");
// }
export function getTemplatesFromDb() {
  return mode === "lite"
    ? http.get(apiUrl + "/templatesdatafromdb?format=summary")
    : http.get(apiUrl + "/templatesdatafromdb");
}
export async function getTemplatesOfProjects(projectId = "lite") {
  return http.get(
    apiUrl + "/projects/" + encodeURIComponent(projectId) + "/templates?format=summary"
  );
}

export async function getTemplates(projectId = "lite") {
  return http.get(apiUrl + "/projects/" + encodeURIComponent(projectId) + "/templates");
}

export function downloadTemplates(tempIDlist, selection) {
  return http.post(apiUrl + "/templates/download", tempIDlist, {
    responseType: "blob",
  });
}

export function deleteTemplate(templateID) {
  return http.delete(apiUrl + "/templates/" + encodeURIComponent(templateID));
}

export function getTemplatesUniversal() {
  return http.get(apiUrl + "/templates?format=summary");
}

export function getAllTemplates() {
  return http.get(apiUrl + "/templates");
}

export function deleteProjectsTemplate(templateID, projectID) {
  return http.delete(`${apiUrl}/projects/${encodeURIComponent(projectID)}/templates/${encodeURIComponent(templateID)}`);
}

export function addTemplateToProject(templateID, projectID) {
  return http.put(`${apiUrl}/projects/${encodeURIComponent(projectID)}/templates/${encodeURIComponent(templateID)}`);
}
