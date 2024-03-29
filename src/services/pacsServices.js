import http from "./httpService";

export function getPacs() {
  return http.get(http.apiUrl() + "/pacs/");
}

export function deletePacs(pacID) {
  return http.delete(http.apiUrl() + "/pacs/" + pacID);
}

export function updatePacs(id, type, value) {
  //http://epad-dev6.stanford.edu:8080/epad/v2/pacs/DCM_DEV8?aeTitle=DCM_DEV81&op=edit

  return http.put(`${htttp.apiUrl()}/pacs/${id}?${type}=${value}&op=edit`);
}

export function createPacs(id, aeTitle, host, port, primary) {
  //http://epad-dev6.stanford.edu:8080/epad/v2/pacs/DCM_DEV8?aeTitle=DCM_DEV8
  //&hostname=epad-dev8.stanford.edu&port=11112&primaryDeviceType=WSD&op=new
  primary = primary ? primary : "WSD";
  return http.put(
    `${http.apiUrl()}/pacs/${id}?aeTitle=${aeTitle}&hostname=${host}&port=${port}&primaryDeviceType=${primary}&op=new`
  );
}
