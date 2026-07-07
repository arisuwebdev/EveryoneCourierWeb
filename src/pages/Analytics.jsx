// import React, { useState, useEffect } from "react";
// import { base44 } from "@/api/base44Client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Package, Users, DollarSign, CheckCircle, Clock } from "lucide-react";
import { format, subDays, parseISO } from "date-fns";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

export default function Analytics() {
  // const [jobs, setJobs] = useState([]);
  // const [applications, setApplications] = useState([]);
  // const [payments, setPayments] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);

  const [jobs] = useState([
  {
    id: 1,
    created_date: "2026-07-01",
    status: "delivered",
    vehicle_required: "car",
  },
  {
    id: 2,
    created_date: "2026-07-02",
    status: "open",
    vehicle_required: "motorcycle",
  },
  {
    id: 3,
    created_date: "2026-07-03",
    status: "assigned",
    vehicle_required: "van",
  },
  {
    id: 4,
    created_date: "2026-07-04",
    status: "delivered",
    vehicle_required: "car",
  },
]);

const [applications] = useState([
  {
    created_date: "2026-07-01",
    status: "accepted",
  },
  {
    created_date: "2026-07-02",
    status: "pending",
  },
  {
    created_date: "2026-07-03",
    status: "accepted",
  },
]);

const [payments] = useState([
  {
    created_date: "2026-07-01",
    payment_status: "completed",
    total_charged: 120,
  },
  {
    created_date: "2026-07-03",
    payment_status: "completed",
    total_charged: 80,
  },
  {
    created_date: "2026-07-04",
    payment_status: "completed",
    total_charged: 150,
  },
]);

const isLoading = false;

  // useEffect(() => {
  //   const load = async () => {
  //     const [j, a, p] = await Promise.all([
  //       base44.entities.DeliveryJob.list("-created_date", 200),
  //       base44.entities.JobApplication.list("-created_date", 200),
  //       base44.entities.Payment.list("-created_date", 200),
  //     ]);
  //     setJobs(j);
  //     setApplications(a);
  //     setPayments(p);
  //     setIsLoading(false);
  //   };
  //   load();
  // }, []);

  // --- Jobs per day (last 14 days) ---
  const jobsPerDay = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const label = format(day, "MMM d");
    const dayStr = format(day, "yyyy-MM-dd");
    const count = jobs.filter(j => j.created_date?.startsWith(dayStr)).length;
    return { label, count };
  });

  // --- Application conversion (applied → accepted) per day ---
  const conversionPerDay = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const label = format(day, "MMM d");
    const dayStr = format(day, "yyyy-MM-dd");
    const dayApps = applications.filter(a => a.created_date?.startsWith(dayStr));
    const applied = dayApps.length;
    const accepted = dayApps.filter(a => a.status === "accepted").length;
    const rate = applied > 0 ? Math.round((accepted / applied) * 100) : 0;
    return { label, applied, accepted, rate };
  });

  // --- Revenue per day ---
  const revenuePerDay = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const label = format(day, "MMM d");
    const dayStr = format(day, "yyyy-MM-dd");
    const revenue = payments
      .filter(p => p.payment_status === "completed" && p.created_date?.startsWith(dayStr))
      .reduce((sum, p) => sum + (p.total_charged || 0), 0);
    return { label, revenue: parseFloat(revenue.toFixed(2)) };
  });

  // --- Job status breakdown ---
  const statusBreakdown = ["open", "assigned", "picked_up", "delivered", "cancelled"].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1).replace("_", " "),
    value: jobs.filter(j => j.status === s).length,
  })).filter(s => s.value > 0);

  // --- Vehicle type demand ---
  const vehicleBreakdown = ["any", "car", "ute", "van", "motorcycle", "bicycle"].map(v => ({
    vehicle: v.charAt(0).toUpperCase() + v.slice(1),
    jobs: jobs.filter(j => j.vehicle_required === v).length,
  })).filter(v => v.jobs > 0);

  // --- KPI cards ---
  const totalRevenue = payments.filter(p => p.payment_status === "completed").reduce((s, p) => s + (p.total_charged || 0), 0);
  const conversionRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === "accepted").length / applications.length) * 100)
    : 0;
  const completedJobs = jobs.filter(j => j.status === "delivered").length;
  const activeJobs = jobs.filter(j => ["open", "assigned", "picked_up"].includes(j.status)).length;

  const kpis = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Completed Jobs", value: completedJobs, icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Active Jobs", value: activeJobs, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "App Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Total Jobs", value: jobs.length, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Applications", value: applications.length, icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">Platform performance overview — last 14 days</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Jobs Posted + Revenue side by side */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Jobs Posted (last 14 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={jobsPerDay}>
                  <defs>
                    <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#jobGrad)" strokeWidth={2} name="Jobs" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Daily Revenue ($)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenuePerDay}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate + Status Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Application Conversion Rate (%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={conversionPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, "Conversion"]} />
                  <Line type="monotone" dataKey="rate" stroke="#f59e0b" strokeWidth={2} dot={false} name="Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Job Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {statusBreakdown.length === 0 ? (
                <p className="text-slate-400 text-sm py-8">No job data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {statusBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Applications applied vs accepted + Vehicle demand */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Applications: Applied vs Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={conversionPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend iconType="circle" iconSize={10} />
                  <Bar dataKey="applied" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applied" />
                  <Bar dataKey="accepted" fill="#10b981" radius={[4, 4, 0, 0]} name="Accepted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-700">Vehicle Type Demand</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicleBreakdown.length === 0 ? (
                <p className="text-slate-400 text-sm py-8 text-center">No vehicle data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={vehicleBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="vehicle" type="category" tick={{ fontSize: 11 }} tickLine={false} width={70} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#22d3ee" radius={[0, 4, 4, 0]} name="Jobs" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}