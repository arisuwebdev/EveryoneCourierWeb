import axios from "axios";

let isHandlingSessionExpiry = false;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response?.status === 401 &&
      !isHandlingSessionExpiry
    ) {
      isHandlingSessionExpiry = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("tokenExpiry");

      window.location.href = "/current-project/react-project/EveryoneCourior/login";
    }

    return Promise.reject(error);
  }
);