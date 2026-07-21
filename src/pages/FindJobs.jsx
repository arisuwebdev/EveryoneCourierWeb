
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { findJob } from "../api/ApiServices/jobrelated/findJobService";
// import { useNotificationTrigger } from "../components/notifications/useNotificationTrigger";

export default function FindJobs() {
  // const [user, setUser] = useState(null);
const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    packageSize: "all",
    minPrice: "",
    maxPrice: "",
    urgent: false,
  });

  // const { notifyJobApplication } = useNotificationTrigger();

  // const loadJobsAndUser = async () => {
  //   try {
  //     const currentUser = await base44.auth.me();
  //     setUser(currentUser);

  //     const availableJobs = await base44.entities.DeliveryJob.filter({ status: "open" }, '-created_date');
  //     setJobs(availableJobs);
  //   } catch (error) {
  //     console.error("Error loading jobs:", error);
  //   }
  //   setIsLoading(false);
  // };

  const applyFilters = useCallback(() => {
    let filtered = jobs;

    if (filters.location) {
      filtered = filtered.filter(
        (job) =>
          job.pickup_address
            .toLowerCase()
            .includes(filters.location.toLowerCase()) ||
          job.delivery_address
            .toLowerCase()
            .includes(filters.location.toLowerCase()),
      );
    }

    if (filters.packageSize !== "all") {
      filtered = filtered.filter(
        (job) => job.package_size === filters.packageSize,
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (job) => job.price >= parseFloat(filters.minPrice),
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (job) => job.price <= parseFloat(filters.maxPrice),
      );
    }

    if (filters.urgent) {
      filtered = filtered.filter((job) => job.urgent);
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]); // Dependencies for useCallback

  // useEffect(() => {
  //   loadJobsAndUser();
  // }, []);

  // useEffect(() => {
  //   applyFilters();
  // }, [applyFilters]);

  const handleApply = (jobId) => {
    console.log("Applied for job:", jobId);
    alert("Application submitted successfully!");
  };

  const loadJobs = async () => {
    if (!token) return;

    setIsLoading(true);

    try {
      const params = {};

      if (filters.location) params.location = filters.location;

      if (filters.packageSize !== "all")
        params.package_size = filters.packageSize.toUpperCase();

      if (filters.minPrice) params.price_min = filters.minPrice;

      if (filters.maxPrice) params.price_max = filters.maxPrice;

      if (filters.urgent) params.urgent = 1;

      const res = await findJob(params, token);

      setJobs(res.payload.jobs || []);
      setFilteredJobs(res.payload.jobs || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadJobs();
  }, [filters]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Available Delivery Jobs
          </h1>
          <p className="text-slate-600">
            Find delivery jobs along your route and earn extra money
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 rounded mb-4"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-slate-600">
                    {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                <div className="grid gap-6">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onApply={handleApply}
                      userVerified={user?.id_verified}
                      userType={user?.user_type}
                    />
                  ))}
                  
                  {filteredJobs.length === 0 && (
                    <Card className="text-center py-12">
                      <CardContent>
                        <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                        <p className="text-slate-600">
                          Try adjusting your filters or check back later for new opportunities
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
