import axios from "axios";
import { customerSaveJobReview } from "../../apiEndPoint";

export const customerSaveReview = async (data, token) => {
  const response = await axios.post(customerSaveJobReview, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};