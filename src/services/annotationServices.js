import http from "./httpService";
import { apiUrl } from "../config.json";

export function getAnnotations(series, opts = {}) {
  console.log(series);
  const { projectId, subjectId, studyId, seriesId } = series;
  const fullUrl =
    apiUrl +
    "/projects/" +
    projectId +
    "/subjects/" +
    subjectId +
    "/studies/" +
    studyId +
    "/series/" +
    seriesId;
  if (Object.entries(opts).length === 0 && opts.constructor === Object)
    return http.get(fullUrl + "/aims/?count=0&format=summary");
  else if (opts["json"]) return http.get(fullUrl + "/aims/?format=json");
  return http.get(+"/aims/?count=0&format=summary");
}

export function getAnnotationsJSON(projectId, subjectId, studyId, seriesId) {
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
      "/aims/?format=json"
  );
}
