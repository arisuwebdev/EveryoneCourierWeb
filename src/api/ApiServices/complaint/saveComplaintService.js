import axios from "axios";
import { saveComplaintApi } from "../../apiEndPoint";

export const saveComplaintService = async (jobId, complaintType, subject, description, token) => {
  const response = await axios.post(
    saveComplaintApi,
    {
      job_id: jobId,
      complaint_type: complaintType,
      subject: subject,
      description: description,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};