import axios from "axios";
import { googleLoginApi } from "../../apiEndPoint";

export const googleLogin = async (data) => {
  const response = await axios.post(
    googleLoginApi,
    {
      name: data.name,
      email: data.email,
      provider: "GOOGLE",
      socialId: data.socialId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};