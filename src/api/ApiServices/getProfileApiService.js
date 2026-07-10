

// import axios from "axios";
// import { getProfileApi } from "../apiEndPoint";

// export const getProfileApi = async (token) => {

//   const response = await axios.get(getProfileApi, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//   });

//   return response.data;
// };


import axios from "axios";
import { getProfileApi } from "../apiEndPoint";

export const getProfile = async (token) => {
  const response = await axios.get(getProfileApi, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};