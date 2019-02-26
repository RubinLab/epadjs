import http from "./httpService";
import { apiUrl } from "../config.json";

export function getPacs() {
  return http.get(apiUrl + "/pacs/");
}
