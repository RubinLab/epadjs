import http from "./httpService";
import { apiUrl } from "../config.json";

export async function getPlugins(projectId) {
  return http.get(apiUrl + "/projects/" + projectId + "/plugins");
}
