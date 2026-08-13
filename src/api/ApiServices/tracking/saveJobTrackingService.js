import axios from "axios";
import { saveJobTrackLocationApi } from "../../apiEndPoint";

export const saveJobTracking = async (data, token) => {
  const response = await axios.post(saveJobTrackLocationApi, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};