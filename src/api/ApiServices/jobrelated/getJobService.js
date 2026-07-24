// import axios from "axios";
// import { getJobApi } from "../../apiEndPoint";

// export const getJob = async (jobId, type, token) => {
//   const response = await axios.get(getJobApi, {
//     params: {
//       job_id: jobId,
//       type: type,
//     },
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: "application/json",
//     },
//   });

//   return response.data;
// };


import axios from "axios";
import { getJobApi } from "../../apiEndPoint";

export const getJob = async (type, token,page = 1) => {
  const response = await axios.get(getJobApi, {
    params: {
      type,
      page,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};