import axios from "axios";
import { SaveCourierReview } from "../../apiEndPoint";

export const saveCourierReview = async (data, token) => {
  const response = await axios.post(SaveCourierReview, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return response.data;
};