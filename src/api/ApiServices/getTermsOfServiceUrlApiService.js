import axios from "axios";
import { getTermsOfServiceUrlApi } from "../apiEndPoint";

export const getTermsOfServiceUrl = async () => {
  const response = await axios.get(getTermsOfServiceUrlApi, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};