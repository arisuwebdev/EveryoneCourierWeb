import axios from "axios";
import { appliedJobApi } from "../../apiEndPoint";

export const appliedJobApplied = async (params, token) => {
  const response = await axios.get(appliedJobApi, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};