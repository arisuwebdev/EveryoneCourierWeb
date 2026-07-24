import axios from "axios";
import { updateJobStatusApi } from "../../apiEndPoint";

export const updateJobStatus = async (data, token) => {
  const response = await axios.post(updateJobStatusApi, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};