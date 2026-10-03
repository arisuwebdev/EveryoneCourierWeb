import axios from "axios";
import { rejectAgreedAmountApi } from "../../apiEndPoint";

export const rejectAgreedAmountService = async (payload, token) => {
  const response = await axios.post(rejectAgreedAmountApi, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};