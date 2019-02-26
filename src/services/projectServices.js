import http from "./httpService";
import { apiUrl } from "../config.json";

export function getProjects() {
  return http.get(apiUrl + "/projects/");
}
