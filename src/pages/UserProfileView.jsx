import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Star,
  Truck,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../lib/AuthContext";
import { getUserProfileService } from "../api/ApiServices/profile/getUserProfileService";
import { format } from "date-fns";
import { decryptId } from "../utils/urlEncryption";

export default function UserProfileView() {
  // const { userId } = useParams();
  const { userId: encryptedUserId } = useParams();

const userId = decryptId(
  decodeURIComponent(encryptedUserId || "")
);
  
  const navigate = useNavigate();
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserProfileService(token, userId);

      if (res.status === 1) {
        setProfile(res.payload.user);
      } else {
        toast.error(res.msg || "Failed to load profile.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">User not found.</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isCourier =
    profile.user_type === "COURIER" || profile.user_type === "BOTH";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={profile.profile_pic} alt={profile.name} />
              <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <CardTitle className="flex items-center justify-center gap-2">
              {profile.name}
              {profile.id_verified === 1 && (
                <CheckCircle2
                  className="w-5 h-5 text-blue-600"
                  title="ID Verified"
                />
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Rating & deliveries */}
            <div className="flex justify-center gap-8 py-4 border-y border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-lg">
                    {Number(profile.rating).toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-lg">
                    {profile.completed_deliveries}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Deliveries</p>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  About
                </p>
                <p className="text-sm text-slate-600">{profile.bio}</p>
              </div>
            )}

            {/* Contact info */}
            <div className="space-y-3">
              {/* email */}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile.email}</span>
                {profile.is_email_verified === "1" && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>
              {/* phone  */}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profile.phone || "Not provided"}</span>
                {profile.is_phone_verified === "1" && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Date of Birth */}
              {profile.date_of_birth && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-400">
                    🎂
                  </span>
                  <span>
                    {format(new Date(profile.date_of_birth), "dd MMM yyyy")}
                  </span>
                </div>
              )}

              {/* Emergency Contact */}
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <PhoneCall className="w-4 h-4 text-red-500" />
                <span>
                  {profile.emergency_contact_no
                    ? `${profile.emergency_contact_no} (Emergency Contact)`
                    : "Not provided"}
                </span>
              </div>

              {profile.address && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{profile.address}</span>
                </div>
              )}
              {isCourier && profile.vehicle_type && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>{profile.vehicle_type}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
