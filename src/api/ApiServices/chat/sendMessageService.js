import axios from "axios";
import { sendMessageApi } from "../../apiEndPoint";

export const sendMessageService = async (payload, token) => {
  const response = await axios.post(sendMessageApi, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};