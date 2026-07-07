import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Calendar, DollarSign, Clock, Zap, AlertCircle, Truck } from "lucide-react";
import { format } from "date-fns";
// Added import as per outline

export default function JobCard({ job, onApply, userVerified }) {
  const getSizeIcon = (size) => {
    switch (size) {
      case 'small': return '📦';
      case 'medium': return '📋';
      case 'large': return '🚛';
      default: return '📦';
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'large': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Added courierPayout calculation as per outline
  const courierPayout = job.price * 0.9; // 90% after 10% platform fee

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-900 mb-2">
              {job.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              {job.urgent && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
              <Badge className={getSizeColor(job.package_size)}>
                {getSizeIcon(job.package_size)} {job.package_size}
              </Badge>
              {job.vehicle_required && job.vehicle_required !== 'any' && (
                <Badge className={job.vehicle_required === 'ute' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                  <Truck className="w-3 h-3 mr-1" />
                  {job.vehicle_required === 'bicycle' ? '🚲' : job.vehicle_required === 'motorcycle' ? '🏍️' : job.vehicle_required === 'car' ? '🚗' : job.vehicle_required === 'van' ? '🚐' : '🛻'} {job.vehicle_required}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
              <DollarSign className="w-5 h-5" />
              {courierPayout?.toFixed(2)} {/* Updated to courierPayout */}
            </div>
            <p className="text-xs text-slate-500">you'll earn</p> {/* Added as per outline */}
            <p className="text-xs text-slate-400">${job.price?.toFixed(2)} job payment</p> {/* Added as per outline */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Locations */}
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

          {/* Package Description */}
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-600">Package</p>
              <p className="text-slate-900">{job.package_description}</p>
            </div>
          </div>

          {/* Dates */}
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
                    Deliver by: {format(new Date(job.delivery_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Special Instructions */}
          {job.special_instructions && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-medium text-amber-900 mb-1">Special Instructions:</p>
              <p className="text-sm text-amber-800">{job.special_instructions}</p>
            </div>
          )}

          {/* Posted Time */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            Posted {format(new Date(job.created_date), "MMM d, yyyy 'at' h:mm a")}
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-6 pt-4 border-t">
          {!userVerified ? (
            <div className="flex items-center gap-2 text-amber-600 text-sm mb-3">
              <AlertCircle className="w-4 h-4" />
              Please verify your identity to apply for jobs
            </div>
          ) : null}
          
          {/* Added payment info div as per outline */}
          <div className="text-xs text-slate-500 mb-3 p-2 bg-slate-50 rounded">
            💰 You'll receive ${courierPayout?.toFixed(2)} after 10% platform fee
          </div>
          
          <Button
            onClick={() => onApply(job.id)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            disabled={!userVerified}
          >
            Apply for This Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}