
import axios from "axios";
import { deviceNotificationTokenApi } from "../../apiEndPoint";

export const updateDeviceNotificationToken = async (
  token,
  deviceType,
  deviceToken
) => {
  const response = await axios.post(
    deviceNotificationTokenApi,
    {
      deviceType,
      deviceToken,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

