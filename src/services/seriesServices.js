import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
const wadoUrl = sessionStorage.getItem("wadoUrl");

export function getSeries(projectId, subjectId, studyId) {
  if (mode === "lite")
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        encodeURIComponent(subjectId) +
        "/studies/" +
        encodeURIComponent(studyId) +
        "/series?&filterDSO=true"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        encodeURIComponent(projectId) +
        "/subjects/" +
        encodeURIComponent(subjectId) +
        "/studies/" +
        encodeURIComponent(studyId) +
        "/series?filterDSO=true"
    );
}
export function getImageIds(series) {
  if (mode === "lite") {
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        encodeURIComponent(series.patientID) +
        "/studies/" +
        encodeURIComponent(series.studyUID) +
        "/series/" +
        encodeURIComponent(series.seriesUID) +
        "/images"
    );
  } else {
    return http.get(
      apiUrl +
        "/projects/" +
        encodeURIComponent(series.projectID) +
        "/subjects/" +
        encodeURIComponent(series.patientID) +
        "/studies/" +
        encodeURIComponent(series.studyUID) +
        "/series/" +
        encodeURIComponent(series.seriesUID) +
        "/images"
    );
  }
}

//  seems like this doesn"t belong to here but olny services know details about paths&server side
export function getWadoImagePath(studyUid, seriesUid, imageId) {
  if (wadoUrl.includes("wadors"))
    return (
      wadoUrl +
      "/studies/" +
      encodeURIComponent(studyUid) +
      "/series/" +
      encodeURIComponent(seriesUid) +
      "/instances/" +
      encodeURIComponent(imageId)
    );
  else
    return (
      wadoUrl +
      "/?requestType=WADO&studyUID=" +
      encodeURIComponent(studyUid) +
      "&seriesUID=" +
      encodeURIComponent(seriesUid) +
      "&objectUID=" +
      encodeURIComponent(imageId)
    );
}

// replace the uri path with rs for now. we should be able to handle both somehow
export function getWadoRSImagePath(studyUid, seriesUid, imageId) {
  return (
    wadoUrl +
    "/studies/" +
    encodeURIComponent(studyUid) +
    "/series/" +
    encodeURIComponent(seriesUid) +
    "/instances/" +
    encodeURIComponent(imageId)
  );
}

export function getImageArrayBuffer(path) {
  let url = wadoUrl + path;
  url = url.replace("wadouri:", "");
  return http.get(url, { responseType: "arraybuffer" });
}
export function downloadSeries(projectID, body) {
  projectID = projectID || "lite";
  const url =
    apiUrl +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/series/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function getSegmentation(series, imageId) {
  const { studyUID, seriesUID } = series;
  const url = getWadoImagePath(studyUID, seriesUID, imageId)
    .replace("wadouri:", "")
    .replace("wadors:", "");
  return http.get(url, { responseType: "arraybuffer" });
}

export function deleteSeries(series, delSys) {
  const { projectID, patientID, studyUID, seriesUID } = series;
  const url =
    apiUrl +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(patientID) +
    "/studies/" +
    encodeURIComponent(studyUID) +
    "/series/" +
    encodeURIComponent(seriesUID) +
    delSys;
  return http.delete(url);
}

export function saveSeries(
  projectID,
  subjectID,
  studyID,
  abbreviation,
  description
) {
  const url =
    apiUrl +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(subjectID) +
    "/studies/" +
    encodeURIComponent(studyID) +
    "/series/" +
    abbreviation;

  return http.put(url, { description });
}

export function uploadFileToSeries(formData, config, series) {
  let { projectID, subjectID, studyUID, seriesUID } = series;
  projectID = projectID || "lite";
  subjectID = subjectID ? subjectID : series.patientID;
  const url = `${apiUrl}/projects/${encodeURIComponent(
    projectID
  )}/subjects/${encodeURIComponent(subjectID)}/studies/${encodeURIComponent(
    studyUID
  )}/series/${encodeURIComponent(seriesUID)}/files`;
  return http.post(url, formData, config);
}

export function updateTagsOfSeries(
  projectID,
  subjectID,
  studyUID,
  seriesUID,
  applyPatient,
  applyStudy,
  body
) {
  const url = `${apiUrl}/projects/${encodeURIComponent(
    projectID
  )}/subjects/${encodeURIComponent(subjectID)}/studies/${encodeURIComponent(
    studyUID
  )}/series/${encodeURIComponent(
    seriesUID
  )}?editTags=true&applyPatient=${applyPatient}&applyStudy=${applyStudy}`;
  return http.put(url, body);
}

export function getSingleSeries(projectId, subjectId, studyUID, seriesUID) {
  return http.get(
    apiUrl +
      "/projects/" +
      encodeURIComponent(projectId) +
      "/subjects/" +
      encodeURIComponent(subjectId) +
      "/studies/" +
      encodeURIComponent(studyUID) +
      "/series/" +
      encodeURIComponent(seriesUID)
  );
}

export function setSignificantSeries(projectId, subjectId, studyUID) {
  const url =
    apiUrl +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/subjects/" +
    encodeURIComponent(subjectID) +
    "/studies/" +
    encodeURIComponent(studyID) +
    "/significantSeries";

  return http.put(url, body);
}
