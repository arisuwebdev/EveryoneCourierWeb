import axios from "axios";
import { getUserProfile } from "../../apiEndPoint";

export const getUserProfileService = async (token, userId) => {
  const response = await axios.get(getUserProfile, {
    params: {
      user_id: userId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};