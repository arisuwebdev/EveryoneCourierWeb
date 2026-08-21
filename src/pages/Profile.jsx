import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Upload,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Camera,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../lib/AuthContext";
import { getProfile } from "../api/ApiServices/getProfileApiService";
import { updateProfile } from "../api/ApiServices/updateProfileApiService";
import { uploadIdCard } from "../api/ApiServices/uploadIdCardService";
import { uploadProfilePic } from "../api/ApiServices/profile/getUploadProfilePicService";
import StripeConnectOnboarding from "../components/payments/StripeConnectOnboarding";
import { toast } from "react-toastify";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    emergency_contact_no: "",
    address: "",
    bio: "",
    user_type: "CUSTOMER",
    vehicle_type: "",
  });
  const { token, user: authUser, updateUser } = useAuth();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const res = await getProfile(token);
      const profile = res.payload.user;
      setUser(profile);

      setProfileData({
        name: res.payload.user.name || "",
        email: res.payload.user.email || "",
        phone: res.payload.user.phone || "",
        emergency_contact_no: res.payload.user.emergency_contact_no || "",
        address: res.payload.user.address || "",
        bio: res.payload.user.bio || "",
        user_type: (res.payload.user.user_type || "CUSTOMER").toUpperCase(),
        vehicle_type: res.payload.user.vehicle_type || "",
      });
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isUnderLimit = file.size <= 5 * 1024 * 1024;

    if (!isImage) {
      toast.error("Please upload an image file");
      return;
    }

    if (!isUnderLimit) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    try {
      setIsUploadingAvatar(true);

      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;

        reader.readAsDataURL(file);
      });

      const res = await uploadProfilePic(token, base64Image);
      const updatedUrl = res?.profile_pic || base64Image;

      setUser((prev) => ({
        ...prev,
        profile_pic: updatedUrl,
      }));

      updateUser?.({
        ...user,
        profile_pic: updatedUrl,
      });

      toast.success("Profile picture updated");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.msg ||
        err?.response?.data?.payload?.verrors ||
        "Failed to upload profile picture";

      toast.error(errorMessage);

      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendOtp = async () => {
    let phoneNumber = profileData.phone.trim();

    if (!phoneNumber) {
      toast.error("Please enter your mobile number.");
      return;
    }

    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+91${phoneNumber}`;
    }

    try {
      setIsSendingOtp(true);

      const container = document.getElementById("recaptcha-container");

      if (!container) {
        toast.error("reCAPTCHA container not found.");
        return;
      }

      // Clear old Firebase verifier
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Clear the container itself
      container.innerHTML = "";

      // Create new verifier
      const recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      });

      window.recaptchaVerifier = recaptchaVerifier;

      // Don't call render() manually
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier,
      );

      setConfirmationResult(confirmation);
      setOtp("");
      setOtpModalOpen(true);

      toast.success("OTP sent successfully!");
    } catch (error) {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      toast.error(error?.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) {
      toast.error("Please request OTP again.");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter 6 digit OTP.");
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const result = await confirmationResult.confirm(otp);

      setPhoneVerified(true);
      setOtpModalOpen(false);
      setOtp("");
      setConfirmationResult(null);

      toast.success("Mobile number verified successfully!");

      // IMPORTANT:
      // Here you should call your backend API
      // to save phone_verified / phone_verified_at.
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        toast.error("Invalid OTP.");
      } else if (error.code === "auth/code-expired") {
        toast.error("OTP expired. Please request a new OTP.");
      } else {
        toast.error("OTP verification failed.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      //here function for if usertype is customer then pass the null value in vehicle

      // const res = await updateProfile(profileData, token);
      const dataToUpdate = {
        ...profileData,
        vehicle_type:
          profileData.user_type === "CUSTOMER"
            ? null
            : profileData.vehicle_type || null,
      };

      const res = await updateProfile(dataToUpdate, token);
      if (res?.payload?.user) {
        updateUser(res.payload.user);
        setUser(res.payload.user);
        setProfileData({
          name: res.payload.user.name || "",
          email: res.payload.user.email || "",
          phone: res.payload.user.phone || "",
          address: res.payload.user.address || "",
          bio: res.payload.user.bio || "",
          user_type: (res.payload.user.user_type || "CUSTOMER").toUpperCase(),
          vehicle_type: res.payload.user.vehicle_type || "",
        });
      } else {
        setUser((prev) => ({
          ...prev,
          ...profileData,
        }));
      }
      toast.success(res?.msg || "Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingId(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          const res = await uploadIdCard(base64Image, token);
          if (res.status === 1) {
            toast.success(res.msg || "ID uploaded successfully!");
            await loadUser();
          } else {
            toast.error(res.msg || "Upload failed.");
          }
        } catch (error) {
          toast.error(error?.response?.data?.msg || "Failed to upload ID.");
        } finally {
          setIsUploadingId(false);
        }
      };

      reader.onerror = () => {
        setIsUploadingId(false);
        toast.error("Failed to read file.");
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploadingId(false);
      toast.error("Something went wrong.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">
            Manage your account and verification status
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* profile picture  */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-md flex items-center justify-center">
                      {avatarPreview || user?.profile_pic ? (
                        <img
                          src={avatarPreview || user.profile_pic}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("avatar-upload").click()
                      }
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={profileData.email} disabled />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>

                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+61 412 345 678"
                        disabled={phoneVerified}
                        className="flex-1"
                      />

                      {/* {phoneVerified ? (
                        <div className="flex items-center px-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                          ✓ Verified
                        </div>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? "Sending..." : "Verify"}
                        </Button>
                      )} */}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_no">
                        Emergency Contact Number (optional)
                      </Label>

                      <Input
                        id="emergency_contact_no"
                        type="tel"
                        value={profileData.emergency_contact_no}
                        onChange={(e) =>
                          handleInputChange(
                            "emergency_contact_no",
                            e.target.value,
                          )
                        }
                        placeholder="+61 412 345 678"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select
                        value={profileData.user_type}
                        onValueChange={(value) =>
                          handleInputChange("user_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CUSTOMER">
                            Customer (Post Jobs)
                          </SelectItem>
                          <SelectItem value="COURIER">
                            Courier (Deliver)
                          </SelectItem>
                          <SelectItem value="BOTH">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Your address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell others about yourself"
                      className="h-24"
                    />
                  </div>

                  {(profileData.user_type === "COURIER" ||
                    profileData.user_type === "BOTH") && (
                    <div className="space-y-2">
                      <Label>Your Vehicle Type</Label>
                      <Select
                        value={profileData.vehicle_type}
                        onValueChange={(value) =>
                          handleInputChange("vehicle_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BICYCLE">🚲 Bicycle</SelectItem>
                          <SelectItem value="MOTORCYCLE">
                            🏍️ Motorcycle
                          </SelectItem>
                          <SelectItem value="CAR">🚗 Car</SelectItem>
                          <SelectItem value="VAN">🚐 Van</SelectItem>
                          <SelectItem value="UTE">🛻 Ute</SelectItem>
                          {/* <SelectItem value="BICYCLE">🚲 Bicycle</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        This helps match you to jobs that suit your vehicle
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Button>
                  <div id="recaptcha-container"></div>
                </form>
              </CardContent>
            </Card>

            {/* ID Verification */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {user?.id_verified ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900">
                      Your identity has been verified! You can now post jobs and
                      apply as a courier.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-900">
                        Please upload a valid ID document to verify your
                        identity and access all features.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="id-upload">Upload ID Document</Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-4">
                          Upload your driver's license, passport, or government
                          ID
                        </p>
                        <input
                          id="id-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleIdUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("id-upload").click()
                          }
                          disabled={isUploadingId}
                        >
                          {isUploadingId ? "Uploading..." : "Choose File"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* ACCOUNT STATS FIRST */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* CUSTOMER */}
                {user?.user_type === "CUSTOMER" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">ID Verification</span>
                      <Badge
                        variant={user?.id_verified ? "default" : "secondary"}
                      >
                        {user?.id_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Email Verification</span>
                      <Badge
                        variant={
                          Number(user?.is_email_verified)
                            ? "default"
                            : "secondary"
                        }
                      >
                        {Number(user?.is_email_verified)
                          ? "Verified"
                          : "Pending"}
                      </Badge>
                    </div>
                  </>
                )}

                {/* COURIER */}
                {user?.user_type === "COURIER" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{Number(user?.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">
                        Completed Deliveries
                      </span>
                      <Badge variant="secondary">
                        {user?.completed_deliveries || 0}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">ID Verification</span>
                      <Badge
                        variant={user?.id_verified ? "default" : "secondary"}
                      >
                        {user?.id_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </>
                )}

                {/* BOTH */}
                {user?.user_type === "BOTH" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{Number(user?.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">
                        Completed Deliveries
                      </span>
                      <Badge variant="secondary">
                        {user?.completed_deliveries || 0}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">ID Verification</span>
                      <Badge
                        variant={user?.id_verified ? "default" : "secondary"}
                      >
                        {user?.id_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Email Verification</span>
                      <Badge
                        variant={
                          Number(user?.is_email_verified)
                            ? "default"
                            : "secondary"
                        }
                      >
                        {Number(user?.is_email_verified)
                          ? "Verified"
                          : "Pending"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* STRIPE CONNECT BELOW ACCOUNT STATS */}
            {(profileData.user_type === "COURIER" ||
              profileData.user_type === "BOTH") && (
              <StripeConnectOnboarding user={authUser} />
            )}
          </div>
        </div>
        {/* this is mobile number verify time modal open  */}
        {otpModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Verify Mobile Number
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Enter the 6-digit OTP sent to your mobile number.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">OTP</Label>

                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setOtpModalOpen(false);
                      setOtp("");
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    className="flex-1 bg-blue-600"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
