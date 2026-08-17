import axios from "axios";
import { confirmJobCompleteApi } from "../../apiEndPoint";

export const confirmJobCompleteService = async (jobId, token) => {
  const response = await axios.post(
    confirmJobCompleteApi,
    {
      job_id: jobId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};