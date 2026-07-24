// import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   MapPin,
//   Package,
//   Calendar,
//   DollarSign,
//   Clock,
//   Zap,
//   AlertCircle,
//   Truck,
// } from "lucide-react";
// import { format } from "date-fns";

// export default function JobCard({ job, onApply, userVerified }) {
//   // Convert API values safely
//   const price = Number(job.price || 0);
//   const courierPayout = price * 0.9;

//   const packageSize = job.package_size?.toLowerCase() || "";
//   const vehicleRequired = job.vehicle_required?.toLowerCase() || "";

//   const getSizeIcon = (size) => {
//     switch (size) {
//       case "small":
//         return "📦";
//       case "medium":
//         return "📋";
//       case "large":
//         return "🚛";
//       default:
//         return "📦";
//     }
//   };

//   const getSizeColor = (size) => {
//     switch (size) {
//       case "small":
//         return "bg-green-100 text-green-800";
//       case "medium":
//         return "bg-yellow-100 text-yellow-800";
//       case "large":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getVehicleIcon = (vehicle) => {
//     switch (vehicle) {
//       case "bicycle":
//         return "🚲";
//       case "motorcycle":
//         return "🏍️";
//       case "car":
//         return "🚗";
//       case "van":
//         return "🚐";
//       case "ute":
//         return "🛻";
//       default:
//         return "🚚";
//     }
//   };

//   return (
//     <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
//       <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
//         <div className="flex justify-between items-start">
//           <div className="flex-1">
//             <CardTitle className="text-lg font-bold text-slate-900 mb-2">
//               {job.title}
//             </CardTitle>

//             <div className="flex flex-wrap gap-2">
//               {job.urgent && (
//                 <Badge className="bg-red-100 text-red-800 border-red-200">
//                   <Zap className="w-3 h-3 mr-1" />
//                   Urgent
//                 </Badge>
//               )}

//               <Badge className={getSizeColor(packageSize)}>
//                 {getSizeIcon(packageSize)} {packageSize || "-"}
//               </Badge>

//               {vehicleRequired && vehicleRequired !== "any" && (
//                 <Badge
//                   className={
//                     vehicleRequired === "ute"
//                       ? "bg-amber-100 text-amber-800"
//                       : "bg-blue-100 text-blue-800"
//                   }
//                 >
//                   <Truck className="w-3 h-3 mr-1" />
//                   {getVehicleIcon(vehicleRequired)} {vehicleRequired}
//                 </Badge>
//               )}
//             </div>
//           </div>

//           <div className="text-right">
//             <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
//               <DollarSign className="w-5 h-5" />
//               {courierPayout.toFixed(2)}
//             </div>

//             <p className="text-xs text-slate-500">You'll earn</p>

//             <p className="text-xs text-slate-400">
//               ${price.toFixed(2)} job payment
//             </p>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-6">
//         <div className="space-y-4">
//           {/* Pickup / Delivery */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="flex items-start gap-3">
//               <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
//               <div>
//                 <p className="text-sm font-medium text-slate-600">Pickup</p>
//                 <p className="text-slate-900">{job.pickup_address}</p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3">
//               <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
//               <div>
//                 <p className="text-sm font-medium text-slate-600">Delivery</p>
//                 <p className="text-slate-900">{job.delivery_address}</p>
//               </div>
//             </div>
//           </div>

//           {/* Package */}
//           <div className="flex items-start gap-3">
//             <Package className="w-5 h-5 text-purple-500 mt-0.5" />
//             <div>
//               <p className="text-sm font-medium text-slate-600">Package</p>
//               <p className="text-slate-900">{job.package_description}</p>
//             </div>
//           </div>

//           {/* Dates */}
//           {(job.pickup_date || job.delivery_date) && (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {job.pickup_date && (
//                 <div className="flex items-center gap-2">
//                   <Calendar className="w-4 h-4 text-slate-500" />
//                   <span className="text-sm text-slate-600">
//                     Pickup:{" "}
//                     {format(new Date(job.pickup_date), "MMM d, yyyy")}
//                   </span>
//                 </div>
//               )}

//               {job.delivery_date && (
//                 <div className="flex items-center gap-2">
//                   <Calendar className="w-4 h-4 text-slate-500" />
//                   <span className="text-sm text-slate-600">
//                     Deliver by:{" "}
//                     {format(new Date(job.delivery_date), "MMM d, yyyy")}
//                   </span>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Instructions */}
//           {job.special_instructions && (
//             <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
//               <p className="text-sm font-medium text-amber-900 mb-1">
//                 Special Instructions
//               </p>
//               <p className="text-sm text-amber-800">
//                 {job.special_instructions}
//               </p>
//             </div>
//           )}

//           {/* Posted */}
//           {job.created_date && (
//             <div className="flex items-center gap-2 text-xs text-slate-500">
//               <Clock className="w-3 h-3" />
//               Posted{" "}
//               {format(new Date(job.created_date), "MMM d, yyyy 'at' h:mm a")}
//             </div>
//           )}
//         </div>

//         <div className="mt-6 pt-4 border-t">
//           {!userVerified && (
//             <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
//               <AlertCircle className="w-4 h-4" />
//               Please verify your identity to apply for jobs
//             </div>
//           )}

//           <div className="text-xs text-slate-500 mb-3 p-2 bg-slate-50 rounded">
//             💰 You'll receive ${courierPayout.toFixed(2)} after the 10%
//             platform fee.
//           </div>

//           <Button
//             onClick={() => onApply(job.id)}
//             className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
//             disabled={!userVerified}
//           >
//             Apply for This Job
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

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
} from "lucide-react";
import { format } from "date-fns";

export default function JobCard({ job, onApply, userVerified, userType }) {
  const { token } = useAuth();

  const [message, setMessage] = useState("");

  const price = Number(job.price || 0);
  const courierPayout = price * 0.9;

  const packageSize = job.package_size?.toLowerCase() || "";
  const vehicleRequired = job.vehicle_required?.toLowerCase() || "";

  const canApply = Number(userVerified) === 1 && (userType === "COURIER" || userType === "BOTH");


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
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "large":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
              {job.urgent && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}

              <Badge className={getSizeColor(packageSize)}>
                <Package className="w-3 h-3 mr-1" />
                {getSizeIcon(packageSize)} {packageSize}
              </Badge>

              <Badge className="bg-blue-100 text-blue-800">
                <Truck className="w-3 h-3 mr-1" />
                {getVehicleIcon(vehicleRequired)}{" "}
                {vehicleRequired.charAt(0).toUpperCase() +
                  vehicleRequired.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="w-5 h-5" />
              {courierPayout.toFixed(2)}
            </div>
            <p className="text-xs text-slate-500">You'll earn</p>
            <p className="text-xs text-slate-400">
              ${price.toFixed(2)} job payment
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

        {job.created_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            {format(new Date(job.created_date), "MMM d, yyyy hh:mm a")}
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
