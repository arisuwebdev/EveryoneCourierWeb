import axios from "axios";
import { negotiationAblyAuthApi } from "../../apiEndPoint";

export const negotiationAblyAuthService = async (
  jobId,
  courierId,
  token
) => {
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