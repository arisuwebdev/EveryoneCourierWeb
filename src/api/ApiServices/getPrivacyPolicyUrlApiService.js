import axios from "axios";
import { getPrivacyPolicyUrlApi } from "../apiEndPoint";

export const getPrivacyPolicyUrl = async () => {
  const response = await axios.get(getPrivacyPolicyUrlApi, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};