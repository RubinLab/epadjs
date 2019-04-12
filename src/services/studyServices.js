import http from "./httpService";
import { isLite, apiUrl, epadws } from "../config.json";

export function getStudies(projectId, subjectId) {
  if (isLite)
    return http.get(
      epadws + "/projects/lite/subjects/" + subjectId + "/studies"
    );
  else
    return http.get(
      apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies/"
    );
}
