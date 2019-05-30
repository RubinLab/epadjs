import http from "./httpService";
import { isLite, apiUrl } from "../config.json";
export function getAnnotations(series, opts = {}) {
  if (isLite) {
    const { projectId, subjectId, studyId, seriesId } = series;
    const fullUrl =
      apiUrl +
      "/projects/lite/subjects/" +
      subjectId +
      "/studies/" +
      studyId +
      "/series/" +
      seriesId;
    if (Object.entries(opts).length === 0 && opts.constructor === Object)
      return http.get(fullUrl + "/aims?count=0&format=summary");
    else if (opts["json"]) return http.get(fullUrl + "/aims?format=json");
    return http.get(+"/aims?count=0&format=summary");
  } else {
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
}

export function getAnnotationsJSON(projectId, subjectId, studyId, seriesId) {
  if (isLite)
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        subjectId +
        "/studies/" +
        studyId +
        "/series/" +
        seriesId +
        "/aims?format=json"
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
        "/series/" +
        seriesId +
        "/aims/?format=json"
    );
}

export function downloadAnnotations(optionObj, aimIDlist, selection) {
  console.log(arguments);
  if (isLite)
    return http.post(
      apiUrl +
        "/projects/lite/aims/download?summary=" +
        optionObj.summary +
        "&aim=" +
        optionObj.aim,
      aimIDlist,
      { responseType: "blob" }
    );
}

export function uploadAim(formData) {
  const url = apiUrl + "/projects/lite/aims";

  console.log("url is", url);
  return http.post(url, formData);
}
