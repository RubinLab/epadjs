import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

// export async function getTemplates(projectId) {
//   return http.get(apiUrl + "/projects/" + projectId + "/templates/");
// }

export async function getAllTemplates(projectId = "lite") {
  return http.get(apiUrl + "/projects/" + projectId + "/templates?format=summary");
}

export async function getTemplates(projectId = "lite") {
  return http.get(apiUrl + "/projects/" + projectId + "/templates");
}

export function downloadTemplates(tempIDlist, selection) {
    return http.post(apiUrl + "/templates/download", tempIDlist, {
      responseType: "blob"
    });
}

export function deleteTemplate(templateID, projectID) {
  return http.delete(apiUrl + "/templates/" + templateID);
}

export function getTemplatesUniversal() {
  return http.get(apiUrl + "/templates?format=summary");
}

export function getTemplatesAlll() {
  return http.get(apiUrl + "/templates");
}