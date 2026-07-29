import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Clock,ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../../lib/AuthContext";
import { getDashboardStats } from "../../api/ApiServices/dashboard/dashboardService";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function RecentActivity() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userType = user?.user_type;

  const isCourier = userType === "COURIER";

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;

      try {
        setIsLoading(true);

        const response = await getDashboardStats(token);

        // Replace these property names with your actual API response
        setJobs(response.payload?.recentJobsPosted || []);
        setApplications(response.payload?.recentAppliedJobs || []);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  const getStatusColor = (status = "") => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200";
      case "ASSIGNED":
        return "bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200";
      case "PICKED_UP":
        return "bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Recent Jobs Posted/Applied */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isCourier ? "Recent Applications" : "Recent Jobs Posted"}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my-jobs")}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(isCourier ? applications : jobs)
                .slice(0, 5)
                .map((item, index) => {
                  const status = isCourier
                    ? item.application_status
                    : item.status;
                  return (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {item.title}
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(
                            new Date(
                              isCourier ? item.applied_at : item.created_at,
                            ),
                            "MMM d, yyyy",
                          )}
                        </div>
                      </div>

                      <Badge className={getStatusColor(status)}>{status}</Badge>
                    </div>
                  );
                })}

              {(isCourier ? applications : jobs).length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  {isCourier ? "No applications yet" : "No jobs posted yet"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sample activity items */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">
                    Welcome to Everyone's a Courier!
                  </p>
                  <p className="text-xs text-slate-500">
                    Complete your profile to get started
                  </p>
                </div>
              </div>

              {jobs.length === 0 && applications.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  No recent activity
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
