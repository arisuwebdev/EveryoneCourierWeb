

import axios from "axios";
import { getNotificationCountApi } from "../../apiEndPoint";

export const getNotificationCount = async (token) => {
  const response = await axios.get(getNotificationCountApi, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};