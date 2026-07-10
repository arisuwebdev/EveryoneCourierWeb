

import axios from "axios";
import { getTermsAcceptedApi } from "../apiEndPoint";

export const getTermsAccepted = async () => {
  const token = localStorage.getItem("token"); 

  const response = await axios.get(getTermsAcceptedApi, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};