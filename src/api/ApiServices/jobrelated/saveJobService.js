import axios from "axios";
import { saveJobApi } from "../../apiEndPoint";

export const saveJob = async (data, token) => {
  const response = await axios.post(saveJobApi, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};