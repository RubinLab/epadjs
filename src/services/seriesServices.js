import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");
const wadoUrl = sessionStorage.getItem("wadoUrl");

export function getSeries(projectId, subjectId, studyId) {
  if (mode === "lite")
    return http.get(
      apiUrl +
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
        "/series?filterDSO=true"
    );
}
export function getImageIds(series) {
  if (mode === "lite") {
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        series.patientID +
        "/studies/" +
        series.studyUID +
        "/series/" +
        series.seriesUID +
        "/images"
    );
  } else {
    return http.get(
      apiUrl +
        "/projects/" +
        series.projectID +
        "/subjects/" +
        series.patientID +
        "/studies/" +
        series.studyUID +
        "/series/" +
        series.seriesUID +
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
      studyUid +
      "/series/" +
      seriesUid +
      "/instances/" +
      imageId
    );
  else
    return (
      wadoUrl +
      "/?requestType=WADO&studyUID=" +
      studyUid +
      "&seriesUID=" +
      seriesUid +
      "&objectUID=" +
      imageId
    );
}

// replace the uri path with rs for now. we should be able to handle both somehow
export function getWadoRSImagePath(studyUid, seriesUid, imageId) {
  return (
    wadoUrl +
    "/studies/" +
    studyUid +
    "/series/" +
    seriesUid +
    "/instances/" +
    imageId
  );
}

export function getImageArrayBuffer(path) {
  let url = wadoUrl + path;
  url = url.replace("wadouri:", "");
  return http.get(url, { responseType: "arraybuffer" });
}
export function downloadSeries(series) {
  const url =
    apiUrl +
    "/projects/" +
    series.projectID +
    "/subjects/" +
    series.patientID +
    "/studies/" +
    series.studyUID +
    "/series/" +
    series.seriesUID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
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
    projectID +
    "/subjects/" +
    patientID +
    "/studies/" +
    studyUID +
    "/series/" +
    seriesUID +
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
    projectID +
    "/subjects/" +
    subjectID +
    "/studies/" +
    studyID +
    "/series/" +
    abbreviation +
    "?description=" +
    description;
  return http.put(url);
}

export function uploadFileToSeries(formData, config, series) {
  let { projectID, subjectID, studyUID, seriesUID } = series;
  subjectID = subjectID ? subjectID : series.patientID;
  const url = `${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}/series/${seriesUID}/files`;
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
  const url = `${apiUrl}/projects/${projectID}/subjects/${subjectID}/studies/${studyUID}/series/${seriesUID}?editTags=true&applyPatient=${applyPatient}&applyStudy=${applyStudy}`;
  return http.put(url, body);
}
