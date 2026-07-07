
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, MapPin, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview({ user, jobs, applications, payments, isLoading }) {
  const totalEarnings = payments?.reduce((sum, payment) => sum + (payment.courier_payout || 0), 0) || 0;
  const totalJobValue = jobs?.filter(job => job.status === 'delivered').reduce((sum, job) => sum + job.price, 0) || 0;

  const stats = [
    {
      title: "Active Jobs",
      value: jobs.filter(job => job.status === 'open').length,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Applications",
      value: applications.length,
      icon: MapPin,
      color: "text-green-600", 
      bgColor: "bg-green-50"
    },
    {
      title: "Completed",
      value: user?.completed_deliveries || 0,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: user?.user_type === 'courier' ? "Total Earned" : "Total Spent",
      value: user?.user_type === 'courier' ? `$${totalEarnings.toFixed(2)}` : `$${totalJobValue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
