import { toast } from "react-toastify";

import axios from "axios";
import auth from "./authService";

//axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = auth.getAuthHeader1();
axios.defaults.headers.common["Content-Type"] =
  "application/x-www-form-urlencoded, multipart/form-data, application/octet-stream, charset=UTF-8";

axios.interceptors.response.use(null, error => {
  console.log(error);
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
