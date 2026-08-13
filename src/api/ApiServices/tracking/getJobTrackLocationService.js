import axios from "axios";
import { getJobTrackLocationApi } from "../../apiEndPoint";

export const getJobTrackLocation = async (jobId, token) => {
  const response = await axios.get(getJobTrackLocationApi, {
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