import axios from "axios";
import { updateProfileApi } from "../apiEndPoint";

export const updateProfile = async (data, token) => {
  const response = await axios.post(updateProfileApi, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};