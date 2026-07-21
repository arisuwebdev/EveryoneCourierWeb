import axios from "axios";
import { getJobApplicationApi } from "../../apiEndPoint";

export const getJobApplicants = async (jobId, token) => {
  const response = await axios.get(getJobApplicationApi, {
    params: {
      job_id: jobId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};