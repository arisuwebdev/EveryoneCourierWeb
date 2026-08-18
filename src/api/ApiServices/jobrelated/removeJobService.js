import axios from "axios";
import { removeJobApi } from "../../apiEndPoint";

export const removeJobService = async (jobId, token) => {
  const response = await axios.post(
    removeJobApi,
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