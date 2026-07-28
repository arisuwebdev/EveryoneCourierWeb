

import axios from "axios";
import { dashboardStatsApi } from "../../apiEndPoint";

export const getDashboardStats = async (token) => {
  const response = await axios.get(dashboardStatsApi, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};