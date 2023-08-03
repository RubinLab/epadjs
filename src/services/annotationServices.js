import http from "./httpService";
// const apiUrl = sessionStorage.getItem("apiUrl");
// const mode = sessionStorage.getItem("mode");

export function getAnnotations(series, opts = {}) {
  const apiUrl = http.apiUrl();
  const mode = http.mode();
  if (mode === "lite") {
    const { projectId, subjectId, studyId, seriesId } = series;
    const fullUrl =
      apiUrl +
      "/projects/lite/subjects/" +
      encodeURIComponent(subjectId) +
      "/studies/" +
      encodeURIComponent(studyId) +
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
      encodeURIComponent(projectId) +
      "/subjects/" +
      encodeURIComponent(subjectId) +
      "/studies/" +
      encodeURIComponent(studyId) +
      "/series/" +
      encodeURIComponent(seriesId);
    if (Object.entries(opts).length === 0 && opts.constructor === Object)
      return http.get(fullUrl + "/aims?count=0&format=summary");
    else if (opts["json"]) return http.get(fullUrl + "/aims?format=json");
    return http.get(+"/aims?count=0&format=summary");
  }
}

export function getAnnotationsJSON(projectId, subjectId, studyId, seriesId) {
  const apiUrl = http.apiUrl();
  const mode = http.mode();
  if (mode === "lite")
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        encodeURIComponent(subjectId) +
        "/studies/" +
        encodeURIComponent(studyId) +
        "/series/" +
        encodeURIComponent(seriesId) +
        "/aims?format=json"
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
        "/series/" +
        encodeURIComponent(seriesId) +
        "/aims?format=json"
    );
}

export function getAnnotations2() {
  return http.get(http.apiUrl() + "/projects/lite/aims");
}

export function searchAnnotations(body, bookmark) {
  // body["fields"]={"teachingFiles":true};
  const url = `${http.apiUrl()}/search${
    bookmark ? `?bookmark=${bookmark}` : ``
  }`;
  return http.put(url, body);
}

export function downloadAnnotations(optionObj, aimIDlist, projectID) {
  projectID = projectID || "lite";
  const { summary, aim, seg } = optionObj;
  const url = `${http.apiUrl()}/projects/${encodeURIComponent(
    projectID
  )}/aims/download?summary=${summary}&aim=${aim}&seg=${seg}`;
  return http.post(url, aimIDlist, { responseType: "blob" });
}

export function downloadAllAnnotations(optionObj, aimIDlist) {
  const { summary, aim, seg } = optionObj;
  const url = `${http.apiUrl()}/aims/download?summary=${summary}&aim=${aim}&seg=${seg}`;
  return http.post(url, aimIDlist, { responseType: "blob" });
}

export function downloadProjectAnnotation(pid) {
  return http.get(
    `${http.apiUrl()}/projects/${encodeURIComponent(pid)}/aims?format=stream`,
    { responseType: "blob" }
  );
}

export function getAllAnnotations(bookmark) {
  const url = `${http.apiUrl()}/aims?format=summary${
    bookmark ? `&bookmark=${bookmark}` : ``
  }`;
  return http.get(url);
}

export function getSummaryAnnotations(projectID, bookmark) {
  const apiUrl = http.apiUrl();
  const pid = projectID || "lite";
  return bookmark
    ? http.get(
        `${apiUrl}/projects/${encodeURIComponent(
          pid
        )}/aims?format=summary&bookmark=${bookmark}`
      )
    : http.get(
        `${apiUrl}/projects/${encodeURIComponent(pid)}/aims?format=summary`
      );
}

export function deleteAnnotation(aimObj, delSys) {
  const query = delSys ? `&${delSys.substring(1)}` : "";
  const { aimID, projectID } = aimObj;
  return http.delete(
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/aims/" +
      encodeURIComponent(aimID) +
      "?deleteDSO=true" +
      query
  );
}

export function deleteAnnotationsList(projectID, aimList) {
  return http.post(
    // apiUrl + "/projects/" + projectID + "/aims/delete?all=true"
    http.apiUrl() +
      "/projects/" +
      encodeURIComponent(projectID) +
      "/aims/delete",
    aimList
  );
}

export function uploadAim(aim, projectId, isUpdate = false, updatedAimId) {
  const apiUrl = http.apiUrl();
  let url;
  if (http.mode() === "lite") {
    url = apiUrl + "/projects/lite/aims";
  } else {
    url = apiUrl + "/projects/" + encodeURIComponent(projectId) + "/aims";
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
  const url =
    http.apiUrl() + "/projects/" + encodeURIComponent(projectId) + "/files";
  const segData = new FormData();
  segData.append("file", segmentation, `${segName}.dcm`);
  const config = {
    headers: {
      "content-type": "multipart/form-data"
    }
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

export function uploadCsv(csvData, config) {
  let url = http.apiUrl() + "/processCsv";
//   const aimData = new FormData();
//   aimData.append("file", csv);
//   const config = {
//     headers: {
//       "content-type": "multipart/form-data",
//     },
//   };
  return http.post(url, csvData, config);
}