import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ApplyJob } from "../../api/ApiServices/jobrelated/jobApplyService";
import { useAuth } from "../../lib/AuthContext";
import { toast } from "react-toastify";
import {
  MapPin,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Zap,
  AlertCircle,
  Truck,
  Scale,
  Ruler
} from "lucide-react";
import { format } from "date-fns";

export default function JobCard({ job, onApply }) {
  const { token, user } = useAuth();

  const userVerified = user?.id_verified;
  const userType = user?.user_type;

  const [message, setMessage] = useState("");

  const price = Number(job.price || 0);
  const courierPayout = Number(job.courier_payout_display || 0);
  const currency = job.currency || "AUD";
  const packageSize = job.package_size?.toLowerCase() || "";
  const vehicleRequired = job.vehicle_required?.toLowerCase() || "";

  const canApply =
    Number(userVerified) === 1 &&
    (userType === "COURIER" || userType === "BOTH");

  const getSizeIcon = (size) => {
    switch (size) {
      case "small":
        return "📦";
      case "medium":
        return "📋";
      case "large":
        return "🚛";
      default:
        return "📦";
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case "small":
        return "bg-green-100 text-green-800 hover:bg-green-200";

      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";

      case "large":
        return "bg-red-100 text-red-800 hover:bg-red-200";

      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case "BYCYCLE":
        return "🚲";
      case "MOTORCYCLE":
        return "🏍️";
      case "CAR":
        return "🚗";
      case "VAN":
        return "🚐";
      case "UTE":
        return "🛻";
      default:
        return "🚚";
    }
  };

  const handleApply = async () => {
    try {
      const payload = {
        job_id: job.id,
        message,
      };

      const response = await ApplyJob(payload, token);

      toast.success(response.msg || "Job applied successfully");

      onApply?.(job.id);
    } catch (error) {
      const apiMessage =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        "Failed to apply for job.";

      toast.error(apiMessage);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900 mb-2">
              {job.title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {job.status && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  {job.status}
                </Badge>
              )}
              {job.urgent && (
                <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}

              <Badge className={getSizeColor(packageSize)}>
                <Package className="w-3 h-3 mr-1" />
                {getSizeIcon(packageSize)} {packageSize}
              </Badge>

              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Truck className="w-3 h-3 mr-1" />
                {getVehicleIcon(vehicleRequired)}{" "}
                {vehicleRequired.charAt(0).toUpperCase() +
                  vehicleRequired.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-col items-end gap-0.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 px-3 py-2">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-semibold text-green-600">
                  {currency}
                </span>
                <span className="text-2xl font-extrabold text-green-700 tracking-tight">
                  {courierPayout.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] font-medium text-green-700/70 uppercase tracking-wide">
                You'll earn
              </p>
            </div>

            <p className="text-xs text-slate-400">
              Job payment:{" "}
              <span className="text-slate-500 font-medium">
                {currency} {price.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* Pickup / Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600">Pickup</p>
              <p className="text-slate-900">{job.pickup_address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600">Delivery</p>
              <p className="text-slate-900">{job.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-purple-500 mt-1" />
          <div>
            <p className="font-medium">Package</p>
            <p>{job.package_description}</p>
          </div>
        </div>

        {/* Package Weight & Dimensions */}
        {(job.weight || job.dimensions) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight */}
            {job.weight && (
              <div className="group rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                    <Scale className="h-5 w-5 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Weight
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {job.weight}{" "}
                      <span className="text-sm font-medium text-slate-500">
                        kg
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dimensions */}
            {job.dimensions && (
              <div className="group rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                    <Ruler className="h-5 w-5 text-purple-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dimensions
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {job.dimensions}
                    </p>

                    <p className="text-xs text-slate-500">L × W × H cm</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(job.pickup_date || job.delivery_date) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {job.pickup_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Pickup: {format(new Date(job.pickup_date), "MMM d, yyyy")}
                </span>
              </div>
            )}

            {job.delivery_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Delivery: {format(new Date(job.delivery_date), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>
        )}

        {job.special_instructions && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-1">
              Special Instructions
            </p>
            <p className="text-sm text-slate-700">{job.special_instructions}</p>
          </div>
        )}

        {job.created_at && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            Posted: {format(new Date(job.created_at), "MMM d, yyyy hh:mm a")}
          </div>
        )}

        <div className="space-y-3 border-t pt-4">
          <Input
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {userType === "CUSTOMER" ? (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Customers cannot apply for delivery jobs.
            </div>
          ) : Number(userVerified) !== 1 ? (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              Please verify your identity first.
            </div>
          ) : null}
          {/* <Button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={!userVerified}
          >
            Apply for This Job
          </Button> */}

          <Button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={!canApply}
          >
            Apply for This Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
