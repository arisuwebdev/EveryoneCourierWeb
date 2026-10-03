import axios from "axios";
import { negotiationAblyAuthApi } from "../../apiEndPoint";

export const negotiationAblyAuthService = async (
  jobId,
  courierId,
  token
) => {
  // console.log("=== negotiationAblyAuthService ===");
  // console.log("jobId:", jobId);
  // console.log("courierId:", courierId);
  // console.log("token exists:", !!token);
  // console.log(
  //   "token preview:",
  //   token ? `${token.substring(0, 20)}...` : "NO TOKEN"
  // );

  const response = await axios.get(negotiationAblyAuthApi, {
    params: {
      job_id: jobId,
      courier_id: courierId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  return response.data;
};