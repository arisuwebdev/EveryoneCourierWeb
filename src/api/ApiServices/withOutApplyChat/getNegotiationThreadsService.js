import axios from "axios";
import { getNegotiationThreadsApi } from "../../apiEndPoint";

export const getNegotiationThreadsService = async (jobId, token) => {
  const response = await axios.get(
    `${getNegotiationThreadsApi}?job_id=${jobId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  return response.data;
};