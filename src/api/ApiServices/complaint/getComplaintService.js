import axios from "axios";
import { getComplaintApi } from "../../apiEndPoint";

export const getComplaintService = async (jobId, token) => {
  const response = await axios.get(getComplaintApi, {
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