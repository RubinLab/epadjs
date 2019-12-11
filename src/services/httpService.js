import { toast } from "react-toastify";
import axios from "axios";
import auth from "./authService";

// axios.defaults.withCredentials = false;
axios.defaults.headers.common["Content-Type"] =
  "application/json, multipart/form-data";

axios.interceptors.request.use(
  config => {
    config.headers.authorization = auth.getAuthHeader1();
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(null, error => {
  console.log("ERROR::");
  console.log(error);
  // console.log("ERROR::", error.response.data);
  if (error.response && error.response.status === 401) {
    //possibly session expired so logout the user and redirect to login
    auth.logout();
  }

  let expectedError;
  if (error.response) {
    expectedError =
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500;
  }

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
