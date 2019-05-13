import { toast } from "react-toastify";

import axios from "axios";
import auth from "./authService";

// axios.defaults.withCredentials = false;
console.log(auth.getAuthHeader1());
axios.defaults.headers.common["Authorization"] = auth.getAuthHeader1();
// axios.defaults.headers.common["Transfer-Encoding"] = "chunked";
axios.defaults.headers.common["Content-Type"] =
  "application/json, multipart/form-data";

axios.interceptors.response.use(null, error => {
  console.log("ERROR::", error.response.data);
  if (error.response.status === 401) {
    //possibly session expired so logout the user and redirect to login
    auth.logout();
  }

  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    console.log("Logging the error", error);
    toast.error("An unexpected error occured.");
  }

  return Promise.reject(error);
});

export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete
};
