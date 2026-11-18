import axios from "axios";
import { DeleteAccountApi } from "../../apiEndPoint";

export const deleteAccountService = async (data) => {
  const response = await axios.post(DeleteAccountApi, data, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};