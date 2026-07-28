import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, Clock, DollarSign } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { getDashboardStats } from "../../api/ApiServices/dashboard/dashboardService";

export default function StatsOverview() {
  const { token, user } = useAuth();

  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardStats(token);
      setStatsData(response.payload);
    } catch (err) {
     
    } finally {
      setIsLoading(false);
    }
  };

const stats = [
  {
    title: "Active Jobs",
    value: statsData?.activeJobs ?? 0,
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Applications",
    value: statsData?.applications ?? 0,
    icon: MapPin,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Completed",
    value: statsData?.completed ?? 0,
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: user?.user_type === "COURIER" ? "Total Earned" : "Total Spent",
    value:
      user?.user_type === "COURIER"
        ? `$${Number(statsData?.totalEarned ?? 0).toFixed(2)}`
        : `$${Number(statsData?.totalSpent ?? 0).toFixed(2)}`,
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.title}
                </p>

                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
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