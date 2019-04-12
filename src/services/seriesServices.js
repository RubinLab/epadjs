import http from "./httpService";
import { isLite, apiUrl, epadws } from "../config.json";

export function getSeries(projectId, subjectId, studyId) {
  if (isLite)
    return http.get(
      epadws +
        "/projects/lite/subjects/" +
        subjectId +
        "/studies/" +
        studyId +
        "/series?&filterDSO=true"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        projectId +
        "/subjects/" +
        subjectId +
        "/studies/" +
        studyId +
        "/series/?&filterDSO=true"
    );
}
export function getImageIds(series) {
  if (isLite)
    return http.get(
      epadws +
        "/projects/lite/subjects/" +
        series.subjectId +
        "/studies/" +
        series.studyId +
        "/series/" +
        series.seriesId +
        "/images"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        series.projectId +
        "/subjects/" +
        series.subjectId +
        "/studies/" +
        series.studyId +
        "/series/" +
        series.seriesId +
        "/images/"
    );
}
