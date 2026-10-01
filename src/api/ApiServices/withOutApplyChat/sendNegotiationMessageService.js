import axios from "axios";
import { sendNegotiationMessageApi } from "../../apiEndPoint";

export const sendNegotiationMessageService = async (payload, token) => {
  const response = await axios.post(sendNegotiationMessageApi, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};