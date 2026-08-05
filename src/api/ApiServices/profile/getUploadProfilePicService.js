import axios from "axios";
import { getUploadProfile } from "../../apiEndPoint";

export const uploadProfilePic = async (token, profilePic) => {
  const response = await axios.post(
    getUploadProfile,
    {
      profile_pic: profilePic,
    },
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