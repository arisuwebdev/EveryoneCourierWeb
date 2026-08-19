
import axios from "axios";
import { getJobChatPresenceApi } from "../../apiEndPoint";

export const getJobChatPresenceService = async (jobId, token) => {
  const response = await axios.get(getJobChatPresenceApi, {
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