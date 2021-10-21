import http from "./httpService";

export function getWaterfallReport(
  projectID,
  subjectUIDs,
  pairs,
  type = "BASELINE",
  metric = "RECIST",
  exportCalcs
) {
  let url = `${http.apiUrl()}/reports/waterfall?type=${type}&metric=${metric}`;
  if (exportCalcs) url += `&exportCalcs=${JSON.stringify(exportCalcs)}`;
  const body = pairs
    ? { pairs }
    : projectID && subjectUIDs
    ? { projectID, subjectUIDs }
    : { projectID };
  return http.post(url, body);
}

export function getReport(projectId, patId, filter) {
  const url =
    http.apiUrl() +
    "/projects/" +
    encodeURIComponent(projectId) +
    "/subjects/" +
    encodeURIComponent(patId) +
    "/aims?" +
    filter;
  return http.get(url);
}
