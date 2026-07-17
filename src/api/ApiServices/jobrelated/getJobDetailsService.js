import axios from "axios";
import { getJobApi } from "../../apiEndPoint";

export const getJobDetails = async (jobId, type, token) => {
  const response = await axios.get(getJobApi, {
    params: {
      job_id: jobId,
      type,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};