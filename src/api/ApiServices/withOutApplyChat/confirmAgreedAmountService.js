import axios from "axios";
import { confirmAgreedAmountApi } from "../../apiEndPoint";

export const confirmAgreedAmountService = async (payload, token) => {
  const response = await axios.post(confirmAgreedAmountApi, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};