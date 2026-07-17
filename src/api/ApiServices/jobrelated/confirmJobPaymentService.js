import axios from "axios";
import { confirmJobPaymentApi } from "../../apiEndPoint";

export const confirmJobPayment = async (data, token) => {
  const response = await axios.post(confirmJobPaymentApi, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};