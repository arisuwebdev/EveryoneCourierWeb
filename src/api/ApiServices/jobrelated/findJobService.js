import axios from "axios";
import { findJobApi } from "../../apiEndPoint";

export const findJob = async (params, token) => {
  const response = await axios.get(findJobApi, {
    params,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};