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
import { useAuth } from "../lib/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

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

        <p className="text-slate-600 mb-6">
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

        {user && Number(user.id_verified) !== 1 && (
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
                    courier.
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
        )}

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

        {/* <AIJobMatches user={user} jobs={jobs} applications={applications} /> */}

        <ReferralCard />
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
