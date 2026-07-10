import axios from "axios";
import { ForgotPasswordApi } from "../apiEndPoint";

export const forgotPassword = async (data) => {
  const response = await axios.post(
    ForgotPasswordApi,
    data,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};