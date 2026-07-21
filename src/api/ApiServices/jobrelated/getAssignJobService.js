import axios from "axios";
import { getAssignJobApi } from "../../apiEndPoint";

export const getAssignJob = async (jobId, applicationId, token) => {
  const response = await axios.post(
    getAssignJobApi,
    {
      job_id: jobId,
      application_id: applicationId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};