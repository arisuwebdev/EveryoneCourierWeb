import axios from "axios";
import { changePasswordApi } from "../../apiEndPoint";

export const changePassword = async (data, token) => {
  const response = await axios.post(changePasswordApi, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

