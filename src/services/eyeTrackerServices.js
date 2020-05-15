import http from "./httpService";

const eyeTrackerUrl = "http://127.0.0.1:5000";

export function startEyeTrackerLog() {
  return http.post(eyeTrackerUrl + "/start");
}
export function stopEyeTrackerLog(log) {
  return http.post(eyeTrackerUrl + "/stop", log);
}
export function setCapture(shouldLog) {
  return http.post(eyeTrackerUrl + "/capture", shouldLog);
}
