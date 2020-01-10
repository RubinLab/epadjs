import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

// export async function getTemplates(projectId) {
//   return http.get(apiUrl + "/projects/" + projectId + "/templates/");
// }

export async function getAllTemplates() {
  return mode === "lite"
    ? http.get(apiUrl + "/templates?format=summary")
    : http.get(apiUrl + "/templates?format=summary");
}

export async function getTemplates() {
  return http.get(apiUrl + "/templates");
}

export function downloadTemplates(tempIDlist, selection) {
  if (mode === "lite") {
    return http.post(apiUrl + "/templates/download", tempIDlist, {
      responseType: "blob"
    });
  }
}

export function deleteTemplate(templateID, projectID) {
  return http.delete(apiUrl + "/templates/" + templateID);
}
