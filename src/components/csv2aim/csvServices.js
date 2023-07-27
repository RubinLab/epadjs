import http from "../../services/httpService";

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