
import axios from "axios";
import { LoginApi } from "../apiEndPoint";

export const loginUser = async (data) => {
  const response = await axios.post(LoginApi, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};