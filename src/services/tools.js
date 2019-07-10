import http from "./httpService";
import { apiUrl } from "../config.json";

export async function getTools() {
  return http.get(apiUrl + "/plugins/?format=json");
}

export async function deleteTool() {
  return http.delete(apiUrl + "/plugins/?format=json");
}
