import axios from "axios";
import { getNegotiationMessagesApi } from "../../apiEndPoint";

export const getNegotiationMessageService = async (
  jobId,
  courierId,
  token
) => {
  const response = await axios.get(getNegotiationMessagesApi, {
    params: {
      job_id: jobId,
      courier_id: courierId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};