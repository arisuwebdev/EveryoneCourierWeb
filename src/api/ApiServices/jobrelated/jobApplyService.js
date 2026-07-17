import axios from "axios";
import { applyJobApi } from "../../apiEndPoint";

export const ApplyJob = async (data, token) => {
  const response = await axios.post(
    applyJobApi,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};