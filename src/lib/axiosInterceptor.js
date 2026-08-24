// import axios from "axios";

// let isHandlingSessionExpiry = false;

// axios.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     if (
//       error.response?.status === 401 &&
//       !isHandlingSessionExpiry
//     ) {
//       isHandlingSessionExpiry = true;

//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       localStorage.removeItem("isLoggedIn");
//       localStorage.removeItem("tokenExpiry");

//       window.location.href = "/current-project/react-project/EveryoneCourior/login";
//     }

//     return Promise.reject(error);
//   }
// );



import axios from "axios";

let isHandlingSessionExpiry = false;
let isHandlingServerError = false;

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // 401 - Session expired
    if (status === 401 && !isHandlingSessionExpiry) {
      isHandlingSessionExpiry = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("tokenExpiry");

      window.location.href =
        "/current-project/react-project/EveryoneCourior/login";

      return Promise.reject(error);
    }

    // 500 - Internal Server Error
    if (
      status === 500 &&
      !isHandlingServerError &&
      !window.location.pathname.endsWith("/500")
    ) {
      isHandlingServerError = true;

      window.location.href =
        "/current-project/react-project/EveryoneCourior/500";

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);