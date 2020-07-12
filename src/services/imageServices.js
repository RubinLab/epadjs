import http from "./httpService";
const wadoUrl = sessionStorage.getItem("wadoUrl");

export function getMetadata(imageUrl) {
  // console.log("url: ", imageUrl.split("wadors:")[1] + "/metadata");
  return http.get(imageUrl.split("wadors:")[1] + "/metadata");
  // return http.get(imageUrl + "/metadata");
}
