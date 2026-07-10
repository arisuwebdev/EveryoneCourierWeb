import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  MapPin,
  Package,
  DollarSign,
  Users,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIJobMatches({ user, jobs, applications }) {
  const [matches, setMatches] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isCourier = user?.user_type === "courier" || !user?.user_type;

  const getMatches = () => {
    setIsLoading(true);

    setTimeout(() => {
      setMatches({
        type: "courier",
        message: "AI matching is currently unavailable.",
      });

      setIsLoading(false);
    }, 500);
  };

  return (
    <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-violet-50 to-indigo-50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-indigo-900">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI-Powered Matches
          </CardTitle>
          {matches && (
            <Button
              variant="ghost"
              size="sm"
              onClick={getMatches}
              disabled={isLoading}
              className="text-indigo-600"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          )}
        </div>
        <p className="text-sm text-indigo-600/80">
          {isCourier
            ? "Jobs tailored to your profile & location"
            : "Top couriers for your open job"}
        </p>
      </CardHeader>

      <CardContent>
        {!matches && !isLoading && (
          <div className="text-center py-6">
            <Sparkles className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4 text-sm">
              {isCourier
                ? "Let AI find the best delivery jobs for you"
                : "Let AI recommend the best couriers for your job"}
            </p>
            <Button
              onClick={getMatches}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Find My Matches
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-indigo-600 font-medium">
              AI is finding your best matches...
            </p>
          </div>
        )}

        {matches && !isLoading && (
          <>
            {matches.message ? (
              <p className="text-center text-slate-500 text-sm py-4">
                {matches.message}
              </p>
            ) : (
              <div className="space-y-3">
                {matches.type === "courier" &&
                  matches.results.map((job, i) => (
                    <Link
                      key={job.id}
                      to={createPageUrl("FindJobs")}
                      className="block"
                    >
                      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-indigo-100 group">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                                #{i + 1} Match
                              </Badge>
                              {job.urgent && (
                                <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="font-semibold text-slate-900 truncate">
                              {job.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.pickup_address?.substring(0, 25)}...
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {job.package_size}
                              </span>
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <DollarSign className="w-3 h-3" />
                                {job.price}
                              </span>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2 italic">
                              ✨ {job.reason}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors mt-1 flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}

                {matches.type === "customer" && (
                  <>
                    <p className="text-xs text-slate-500 mb-2">
                      For your job:{" "}
                      <span className="font-semibold text-slate-700">
                        {matches.job?.title}
                      </span>
                    </p>
                    {matches.results.map((courier, i) => (
                      <div
                        key={courier.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {courier.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-slate-900 text-sm">
                                {courier.full_name}
                              </p>
                              <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                                #{i + 1}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {courier.completed_deliveries || 0} deliveries
                              </span>
                            </div>
                            <p className="text-xs text-indigo-600 mt-1 italic">
                              ✨ {courier.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
