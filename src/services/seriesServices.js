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
  console.log(series);
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

//  seems like this doesn't belong to here but olny services know details about paths&server side
export function getWadoImagePath(studyUid, seriesUid, imageId) {
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
  const url = getWadoImagePath(studyUID, seriesUID, imageId).replace(
    "wadouri:",
    ""
  );
  return http.get(url, { responseType: "arraybuffer" });
}

export function deleteSeries(series) {
  if (mode === "lite") {
    const url =
      apiUrl +
      "/projects/lite/subjects/" +
      series.patientID +
      "/studies/" +
      series.studyUID +
      "/series/" +
      series.seriesUID;
    return http.delete(url);
  }
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

export function uploadFile(formData, config, projectID, subject, study, series) {
  if (mode === "lite") {
    return http.post(`${apiUrl}/projects/lite/subjects/${subject}/studies/${study}/series/${series}/files`, formData, config);
  } else {
    const url =
    `${apiUrl}/projects/${projectID}/subjects/${subject}/studies/${study}/series/${series}/files`;
    return http.post(url, formData, config);
  }
}