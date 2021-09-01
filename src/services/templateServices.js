import http from "./httpService";

// export async function getTemplates(projectId) {
//   return http.get(apiUrl + "/projects/" + projectId + "/templates/");
// }
export function getTemplatesFromDb() {
  const apiUrl = http.apiUrl();
  return http.mode() === "lite"
    ? http.get(apiUrl + "/templatesdatafromdb?format=summary")
    : http.get(apiUrl + "/templatesdatafromdb");
}
export async function getTemplatesOfProjects(projectId = "lite") {
  return http.get(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectId) +
      "/templates?format=summary"
  );
}

export async function getTemplates(projectId = "lite") {
  return http.get(
    http.apiUrl() + "/projects/" + encodeURIComponent(projectId) + "/templates"
  );
}

export function downloadTemplates(tempIDlist, selection) {
  return http.post(http.apiUrl() + "/templates/download", tempIDlist, {
    responseType: "blob",
  });
}

export function deleteTemplate(templateID) {
  return http.delete(
    http.apiUrl() + "/templates/" + encodeURIComponent(templateID)
  );
}

export function getTemplatesUniversal() {
  return http.get(http.apiUrl() + "/templates?format=summary");
}

export function getAllTemplates() {
  return http.get(http.apiUrl() + "/templates");
}

export function deleteProjectsTemplate(templateID, projectID) {
  return http.delete(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/templates/${encodeURIComponent(templateID)}`
  );
}

export function addTemplateToProject(templateID, projectID) {
  return http.put(
    `${http.apiUrl()}/projects/${encodeURIComponent(
      projectID
    )}/templates/${encodeURIComponent(templateID)}`
  );
}
