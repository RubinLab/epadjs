import http from './httpService';
const apiUrl = sessionStorage.getItem('apiUrl');
const mode = sessionStorage.getItem('mode');

export function getWaterfallReport(
  projectID,
  subjectUIDs,
  pairs,
  type = 'BASELINE',
  metric = 'RECIST',
  exportCalcs
) {
  let url = `${apiUrl}/reports/waterfall?type=${type}&metric=${metric}`;
  if (exportCalcs) url += `&exportCalcs=${JSON.stringify(exportCalcs)}`;
  const body = pairs
    ? { pairs }
    :  projectID && subjectUIDs
    ? { projectID, subjectUIDs }
    : { projectID };
  return http.post(url, body);
}

export function getReport(projectId, patId, filter) {
  const url =
    apiUrl +
    "/projects/" +
    projectId +
    "/subjects/" +
    patId +
    "/aims?" +
    filter;
    return http.get(url);
}