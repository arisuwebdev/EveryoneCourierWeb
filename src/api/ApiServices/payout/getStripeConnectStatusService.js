import axios from "axios";
import { getStripeConnectStatus } from "../../apiEndPoint";

export const getStripeConnectStatusService = async (token) => {
  const response = await axios.get(getStripeConnectStatus, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};