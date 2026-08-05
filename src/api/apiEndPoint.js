import { baseUrl } from "./constant";


// Auth

export const SendOtpApi = baseUrl+ "/auth/register-send-otp";

export const RegisterApi =  baseUrl + "/auth/register";

export const LoginApi =  baseUrl + "/auth/login";

export const LogoutApi =  baseUrl + "/auth/logout";

export const ForgotPasswordApi =  baseUrl + "/auth/forgot-password";

export const getProfileApi =  baseUrl + "/getProfile";

export const updateProfileApi =  baseUrl + "/updateProfile";

export const uploadIdCardApi =  baseUrl + "/uploadIdCard";

export const googleLoginApi =  baseUrl + "/auth/social-login";

//priacy and policy

export const getPrivacyPolicyUrlApi =  baseUrl + "/getPrivacyPolicyUrl";

export const getTermsOfServiceUrlApi =  baseUrl + "/getTermsOfServiceUrl";

export const getTermsAcceptedApi =  baseUrl + "/saveTermsAccepted";


// job related

export const saveJobApi =  baseUrl + "/saveJob";

export const confirmJobPaymentApi =  baseUrl + "/confirmJobPayment";

export const getJobApi =  baseUrl + "/getJob";

export const findJobApi =  baseUrl + "/findJob";

export const applyJobApi =  baseUrl + "/applyJob";

export const getJobApplicationApi =  baseUrl + "/getJobApplicants";

export const getAssignJobApi =  baseUrl + "/assignJob";

export const updateJobStatusApi =  baseUrl + "/updateJobStatus";

export const customerSaveJobReview =  baseUrl + "/saveJobReview";


// dashboard

export const dashboardStatsApi =  baseUrl + "/dashboardStats";

// deviceToken 

export const deviceNotificationTokenApi =  baseUrl + "/updateDeviceToken";

export const getNotificationCountApi =  baseUrl + "/getNotificationCount";

export const getNotificationListApi =  baseUrl + "/getNotificationList";

// profile

export const getUploadProfile =  baseUrl + "/uploadProfilePic";

// payout 

export const getStripeConnectStatus =  baseUrl + "/stripeConnectStatus";

export const getStripeConnectOnboarding =  baseUrl + "/stripeConnectOnboardingLink";






