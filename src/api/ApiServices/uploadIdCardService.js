


import axios from "axios";
import { uploadIdCardApi } from "../apiEndPoint";

export const uploadIdCard = async (idCard, token) => {
  const response = await axios.post(
    uploadIdCardApi,
    {
      id_card: idCard,
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