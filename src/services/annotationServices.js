import http from "./httpService";
const apiUrl = sessionStorage.getItem("apiUrl");
const mode = sessionStorage.getItem("mode");

export function getAnnotations(series, opts = {}) {
  if (mode === "lite") {
    const { projectId, subjectId, studyId, seriesId } = series;
    const fullUrl =
      apiUrl +
      "/projects/lite/subjects/" +
      subjectId +
      "/studies/" +
      studyId +
      "/series/" +
      seriesId;
    if (Object.entries(opts).length === 0 && opts.constructor === Object) {
      return http.get(fullUrl + "/aims?count=0&format=summary");
    } else if (opts["json"]) return http.get(fullUrl + "/aims?format=json");
    return http.get(fullUrl + "/aims?count=0&format=summary");
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
      return http.get(fullUrl + "/aims?count=0&format=summary");
    else if (opts["json"]) return http.get(fullUrl + "/aims?format=json");
    return http.get(+"/aims?count=0&format=summary");
  }
}

export function getAnnotationsJSON(projectId, subjectId, studyId, seriesId) {
  if (mode === "lite")
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
        "/aims?format=json"
    );
}

export function getAnnotations2() {
  return http.get(apiUrl + "/projects/lite/aims");
}

export function downloadAnnotations(optionObj, aimIDlist, projectID) {
  console.log(optionObj, aimIDlist, projectID);
  projectID = projectID || "lite";
  return http.post(
    apiUrl +
      "/projects/" +
      projectID +
      "/aims/download?summary=" +
      optionObj.summary +
      "&aim=" +
      optionObj.aim +
      "&seg=" +
      optionObj.seg,
    aimIDlist,
    { responseType: "blob" }
  );
}

export function getAllAnnotations() {
  return http.get(apiUrl + "/aims?format=summary");
}

export function getSummaryAnnotations(projectID) {
  return mode === "lite"
    ? http.get(apiUrl + "/projects/lite/aims?format=summary")
    : http.get(apiUrl + "/projects/" + projectID + "/aims?format=summary");
}

export function deleteAnnotation(aimObj, delSys) {
  const query = delSys ? `&${delSys.substring(1)}` : "";
  const { aimID, projectID } = aimObj;
  return http.delete(
    apiUrl +
      "/projects/" +
      projectID +
      "/aims/" +
      aimID +
      "?deleteDSO=true" +
      query
  );
}

export function deleteAllAnnotations(projectID, aimList) {
  return http.post(
    apiUrl + "/projects/" + projectID + "/aims/delete?all=true",
    aimList
  );
}

export function uploadAim(aim, projectId, isUpdate = false, updatedAimId) {
  let url;
  if (mode === "lite") {
    url = apiUrl + "/projects/lite/aims";
  } else {
    url = apiUrl + "/projects/" + projectId + "/aims";
  }
  if (isUpdate) return http.put(url + `/${updatedAimId}`, aim);
  else return http.post(url, aim);
}

// Following method uses file backend to handle big aim sizes.
// But it has a significant delay so rerendering markups does not work correctly
// after saving the annotations!!!

// export function uploadAim(aim, projectId, isUpdate = false, updatedAimId) {
//   let url;
//   if (mode === "lite") {
//     url = apiUrl + "/projects/lite/aimfiles";
//   } else {
//     url = apiUrl + "/projects/" + projectId + "/aimfiles";
//   }
//   const aimData = new FormData();
//   aimData.append("file", aim, "aim.json");
//   const config = {
//     headers: {
//       "content-type": "multipart/form-data",
//     },
//   };
//   if (isUpdate) return http.put(url + `/${updatedAimId}`, aimData, config);
//   else return http.post(url, aimData, config);
// }

export function uploadSegmentation(segmentation, segName, projectId = "lite") {
  const url = apiUrl + "/projects/" + projectId + "/files";
  const segData = new FormData();
  segData.append("file", segmentation, `${segName}.dcm`);
  const config = {
    headers: {
      "content-type": "multipart/form-data",
    },
  };
  return http.post(url, segData, config);
}

// export function uploadSegmentation(segmentation, projectId = "lite") {
//   const url = apiUrl + "/projects/" + projectId + "/files";
//   const segData = new FormData();
//   segData.append("file", segmentation, "blob.dcm");
//   const config = {
//     headers: {
//       "content-type": "multipart/form-data",
//     },
//   };
//   return http.post(url, segData, config);
// }
