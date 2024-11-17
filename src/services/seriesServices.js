import http from "./httpService";

export function getSignificantSeries(projectId, subjectId, studyId) {
  return http.get(
    http.apiUrl() + "/projects/" +
    encodeURIComponent(projectId) +
    "/subjects/" +
    encodeURIComponent(subjectId) +
    "/studies/" +
    encodeURIComponent(studyId) + "/significantseries");
}

export function getSeries(projectId, subjectId, studyId, forceDicomweb, fm) {
  // console.log(" ---> ", fm);
  const endpointProject = http.mode() === "lite" ?
    http.apiUrl() + "/projects/lite/subjects/"
    : http.apiUrl() + "/projects/" + encodeURIComponent(projectId) + "/subjects/";
  let endPoint = endpointProject + encodeURIComponent(subjectId) + "/studies/" + encodeURIComponent(studyId) + "/series?&filterDSO=true";
  endPoint = forceDicomweb ? endPoint + "&forceDicomweb=true" : endPoint;
  return http.get(endPoint);
}
export function getImageIds(series) {
  if (http.mode() === "lite") {
    return http.get(
      http.apiUrl() +
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
      http.apiUrl() +
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

export function getMetadata(url) {
  return http.get(url + "/metadata");
}

//  seems like this doesn"t belong to here but olny services know details about paths&server side
export function getWadoImagePath(studyUid, seriesUid, imageId, subpath = "pacs", format = "RS") {
  /* We assume that the PACS/DICOMweb server will respond to both WADO-RS (wadors) and 
  WADO-URI (wadouri)requests. The main distinction between the two paths should be in the 
  inclusion of loader names in the endpoints: wadors uses a loader name in the path, such as 
  http://mydicomweb.com/wadors, while wadouri uses wado in the path, such as http://mydicomweb.com/wado. */

  const wadoUrl = http.wadoUrl();
  if (format === "RS" && wadoUrl.includes("wadors"))
    return (
      wadoUrl +
      "/" + subpath + "/studies/" +
      encodeURIComponent(studyUid) +
      "/series/" +
      encodeURIComponent(seriesUid) +
      "/instances/" +
      imageId
    );
  else
    return (
      wadoUrl.replace('/wadors', '/wado') + "/" + subpath +
      "/?requestType=WADO&studyUID=" +
      encodeURIComponent(studyUid) +
      "&seriesUID=" +
      encodeURIComponent(seriesUid) +
      "&objectUID=" +
      imageId
    );
}

// replace the uri path with rs for now. we should be able to handle both somehow
export function getWadoRSImagePath(studyUid, seriesUid, imageId) {
  return (
    http.wadoUrl() +
    "/studies/" +
    encodeURIComponent(studyUid) +
    "/series/" +
    encodeURIComponent(seriesUid) +
    "/instances/" +
    imageId
  );
}

export function getImageArrayBuffer(path) {
  let url = http.wadoUrl() + path;
  url = url.replace("wadouri:", "");
  return http.get(url, { responseType: "arraybuffer" });
}
export function downloadSeries(projectID, body) {
  projectID = projectID || "lite";
  const url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectID) +
    "/series/download" +
    "?format=stream&includeAims=true";
  return http.post(url, body, { responseType: "blob" });
}

export function getSegmentation(series, imageId) {
  const { studyUID, seriesUID } = series;
  const url = getWadoImagePath(studyUID, seriesUID, imageId, undefined, "URI")
    .replace("wadouri:", "")
    .replace("wadors:", "");
  return http.get(url, { responseType: "arraybuffer" });
}

export function deleteSeries(series, delSys) {
  const { projectID, patientID, studyUID, seriesUID } = series;
  const url =
    http.apiUrl() +
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
    http.apiUrl() +
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
  const url = `${http.apiUrl()}/projects/${encodeURIComponent(
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
  const url = `${http.apiUrl()}/projects/${encodeURIComponent(
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
    http.apiUrl() +
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

export function setSignificantSeries(projectId, subjectId, studyUID, body, force) {
  let url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectId) +
    "/subjects/" +
    encodeURIComponent(subjectId) +
    "/studies/" +
    encodeURIComponent(studyUID) +
    "/significantSeries";

  if (force) url = `${url}?force=true`;
  return http.put(url, body);
}
