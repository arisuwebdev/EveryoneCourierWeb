import React, { useState, useEffect } from "react";
// import { DeliveryJob, JobApplication, Payment } from "@/entities/all";
// import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package, AlertCircle, Megaphone } from "lucide-react";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import ReferralCard from "../components/dashboard/ReferralCard";
import AIJobMatches from "../components/dashboard/AIJobMatches";

export default function Dashboard() {
  // const [user, setUser] = useState(null);
  // const [jobs, setJobs] = useState([]);
  // const [applications, setApplications] = useState([]);
  // const [payments, setPayments] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   loadDashboardData();
  // }, []);

  // const loadDashboardData = async () => {
  //   try {
  //     const currentUser = await base44.auth.me();
  //     setUser(currentUser);

  //     const userJobs = await DeliveryJob.filter({ customer_id: currentUser.id }, '-created_date', 10);
  //     setJobs(userJobs);

  //     const userApplications = await JobApplication.filter({ courier_id: currentUser.id }, '-created_date', 10);
  //     setApplications(userApplications);

  //     // Load payments for earnings tracking
  //     const userPayments = await Payment.filter({ courier_id: currentUser.id, payment_status: 'completed' }, '-processed_at', 20);
  //     setPayments(userPayments);
  //   } catch (error) {
  //     console.error("Error loading dashboard:", error);
  //   }
  //   setIsLoading(false);
  // };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
  //       <Card className="w-96 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
  //         <CardContent className="p-8 text-center">
  //           <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
  //             <Package className="w-8 h-8 text-white" />
  //           </div>
  //           <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
  //           <p className="text-slate-600 mb-6">Please sign in to access your courier dashboard</p>
  //           <Button
  //             onClick={() => window.location.href = '/login'}
  //             className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
  //           >
  //             Sign In
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }


  const user = {
  full_name: "John Doe",
  user_type: "courier",
  id_verified: false,
};

const jobs = [];
const applications = [];
const payments = [];
const isLoading = false;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-slate-600">
            {user.user_type === 'courier' ? 'Find delivery jobs along your route' : 
             user.user_type === 'customer' ? 'Manage your delivery requests' : 
             'Post jobs or find delivery opportunities'}
          </p>
        </div> */}

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back!
        </h1>

        <p className="text-slate-600">
          Find delivery jobs and manage your deliveries.
        </p>

        {/* Launch Notice */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Megaphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900">
                  🚀 We've just launched!
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  We're growing our community of couriers and customers — thanks
                  for being an early member! Please be patient as more couriers
                  join the platform. If you have an{" "}
                  <strong>urgent delivery</strong>, you may need to use a
                  traditional service like Uber or a paid courier in the
                  meantime. We appreciate your support as we build something
                  great together!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Verification Alert */}
        {/* {!user.id_verified && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">
                    Complete your verification
                  </p>
                  <p className="text-sm text-amber-700">
                    Verify your ID to start posting jobs or applying as a
                    courier
                  </p>
                </div>
                <Link to={createPageUrl("Profile")}>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Verify Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )} */}

        <Card className="mb-6 border-amber-200 bg-amber-50">
  <CardContent className="p-4">
    <div className="flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600" />
      <div>
        <p className="font-medium text-amber-900">
          Complete your verification
        </p>
        <p className="text-sm text-amber-700">
          Verify your ID to start posting jobs or applying as a courier.
        </p>
      </div>

      <Link to={createPageUrl("Profile")}>
        <Button variant="outline" size="sm" className="ml-auto">
          Verify Now
        </Button>
      </Link>
    </div>
  </CardContent>
</Card>

        {/* Stats Overview */}
        {/* <StatsOverview
          user={user}
          jobs={jobs}
          applications={applications}
          payments={payments}
          isLoading={isLoading}
        />

        <AIJobMatches user={user} jobs={jobs} applications={applications} />

        <ReferralCard />

        <QuickActions user={user} />
        <RecentActivity
          jobs={jobs}
          applications={applications}
          userType={user.user_type}
          isLoading={isLoading}
        /> */}

    <StatsOverview
  user={user}
  jobs={jobs}
  applications={applications}
  payments={payments}
  isLoading={isLoading}
/>

<AIJobMatches
  user={user}
  jobs={jobs}
  applications={applications}
/>

<QuickActions user={user} />

<RecentActivity
  jobs={jobs}
  applications={applications}
  userType={user.user_type}
  isLoading={isLoading}
/>

      </div>
    </div>
  );
}
