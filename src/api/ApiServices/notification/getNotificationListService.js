
import axios from "axios";
import { getNotificationListApi } from "../../apiEndPoint";

export const getNotificationList = async (token) => {
  const response = await axios.get(getNotificationListApi, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};