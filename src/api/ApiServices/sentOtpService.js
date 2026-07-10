import axios from "axios";
import { SendOtpApi } from "../apiEndPoint";

export const sendOtpService = async (email) => {
  const response = await axios.post(
    SendOtpApi,
    { email },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};