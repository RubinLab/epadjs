import http from "./httpService";
import { apiUrl } from "../config.json";

export function getAnnotations(projectId, subjectId, studyId, seriesId) {
  return http.get(
    apiUrl +
      "/projects/" +
      projectId +
      "/subjects/" +
      subjectId +
      "/studies/" +
      studyId +
      "/series/" +
      seriesId +
      "/aims/?count=0&format=summary"
  );
}
