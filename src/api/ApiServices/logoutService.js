import axios from "axios";
import { LogoutApi } from "../apiEndPoint";

export const logoutUser = async (token) => {
  const response = await axios.post(
    LogoutApi,
    {},
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