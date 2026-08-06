import axios from "axios";
import { StripeConnectOnboardingLink } from "../../apiEndPoint";

export const StripeConnectOnboardingLinkService = async (token) => {
  const response = await axios.post(
    StripeConnectOnboardingLink,
    {},
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