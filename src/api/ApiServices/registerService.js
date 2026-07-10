

import axios from "axios";
import { RegisterApi } from "../apiEndPoint";

export const registerUser = async (data) => {
  const response = await axios.post(RegisterApi, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};