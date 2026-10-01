import axios from "axios";
import { sendAgreedAmountApi } from "../../apiEndPoint";

export const sendAgreedAmountService = async (payload, token) => {
  const response = await axios.post(sendAgreedAmountApi, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};