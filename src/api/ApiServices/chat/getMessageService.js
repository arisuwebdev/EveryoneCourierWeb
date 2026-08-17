import axios from "axios";
import { getMessagesApi } from "../../apiEndPoint";

export const getMessagesService = async (
  jobId,
  token,
  page = 1
) => {
  const response = await axios.get(getMessagesApi, {
    params: {
      job_id: jobId,
      page: page,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};