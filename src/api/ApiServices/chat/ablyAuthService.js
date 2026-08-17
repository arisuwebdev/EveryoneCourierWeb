import axios from "axios";
import { ablyAuthApi } from "../../apiEndPoint";

export const ablyAuthService = async (jobId, token) => {
  const response = await axios.get(ablyAuthApi, {
    params: {
      job_id: jobId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};