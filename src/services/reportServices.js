import http from './httpService';
const apiUrl = sessionStorage.getItem('apiUrl');
const mode = sessionStorage.getItem('mode');

export function getWaterfallReport(
  projectID,
  subjectUIDs,
  pairs,
  type = 'BASELINE',
  metric = 'RECIST',
) {
  const url = `${apiUrl}/reports/waterfall?type=${type}&metric=${metric}`;
  const body = pairs
    ? { pairs }
    :  projectID && subjectUIDs
    ? { projectID, subjectUIDs }
    : { projectID };
  return http.post(url, body);
}
