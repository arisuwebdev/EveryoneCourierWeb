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
import { Upload, Shield, Star, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../lib/AuthContext";
import { getProfile } from "../api/ApiServices/getProfileApiService";
import { updateProfile } from "../api/ApiServices/updateProfileApiService";
import { uploadIdCard } from "../api/ApiServices/uploadIdCardService";
import StripeConnectOnboarding from "../components/payments/StripeConnectOnboarding";
import { toast } from "react-toastify";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    user_type: "customer",
    vehicle_type: "",
  });
  const { token } = useAuth();

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
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        bio: profile.bio || "",
        user_type: (profile.user_type || "CUSTOMER").toUpperCase(),
        vehicle_type: profile.vehicle_type || "",
      });
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const res = await updateProfile(profileData, token);

      if (res?.payload?.user) {
        setUser(res.payload.user);

        setProfileData({
           name: res.payload.user.name || "",
           email: res.payload.user.email || "",
          phone: res.payload.user.phone || "",
          address: res.payload.user.address || "",
          bio: res.payload.user.bio || "",
          user_type: res.payload.user.user_type?.toLowerCase() || "customer",
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
                      <Input value={profileData.email} disabled/>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="Your phone number"
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
                          <SelectItem value="bicycle">🚲 Bicycle</SelectItem>
                          <SelectItem value="motorcycle">
                            🏍️ Motorcycle
                          </SelectItem>
                          <SelectItem value="CAR">🚗 Car</SelectItem>
                          <SelectItem value="VAN">🚐 Van</SelectItem>
                          <SelectItem value="UTE">🛻 Ute</SelectItem>
                           <SelectItem value="MOTORCYCLE">🏍️ Motorcycle</SelectItem>
                            <SelectItem value="BICYCLE">🚲 Bicycle</SelectItem>
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
            {(profileData.user_type === "COURIER" ||
              profileData.user_type === "BOTH") && (
              <StripeConnectOnboarding user={user} />
            )}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Completed Deliveries</span>
                  <Badge variant="secondary">
                    {user?.completed_deliveries || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {/* <span>{user?.rating ? user.rating.toFixed(1) : 'No ratings yet'}</span> */}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Verification Status</span>
                  <Badge variant={user?.id_verified ? "default" : "secondary"}>
                    {user?.id_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
