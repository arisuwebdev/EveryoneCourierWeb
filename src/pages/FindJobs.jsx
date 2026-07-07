// import React, { useState, useEffect, useCallback } from "react";
import React, { useState, useCallback } from "react";
// import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";

import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
// import { useNotificationTrigger } from "../components/notifications/useNotificationTrigger";

export default function FindJobs() {
  // const [user, setUser] = useState(null);
const [jobs] = useState([
  {
    id: 1,
    title: "Deliver Documents",
    pickup_address: "Sydney CBD",
    delivery_address: "Parramatta",
    package_size: "small",
    price: 25,
    urgent: false,
  },
  {
    id: 2,
    title: "Food Package",
    pickup_address: "Bondi",
    delivery_address: "Chatswood",
    package_size: "medium",
    price: 40,
    urgent: true,
  },
  {
    id: 3,
    title: "Laptop Delivery",
    pickup_address: "North Sydney",
    delivery_address: "Airport",
    package_size: "large",
    price: 60,
    urgent: false,
  },
]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    packageSize: "all",
    minPrice: "",
    maxPrice: "",
    urgent: false
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
      filtered = filtered.filter(job => 
        job.pickup_address.toLowerCase().includes(filters.location.toLowerCase()) ||
        job.delivery_address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.packageSize !== "all") {
      filtered = filtered.filter(job => job.package_size === filters.packageSize);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(job => job.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(job => job.price <= parseFloat(filters.maxPrice));
    }

    if (filters.urgent) {
      filtered = filtered.filter(job => job.urgent);
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]); // Dependencies for useCallback

  // useEffect(() => {
  //   loadJobsAndUser();
  // }, []);

  // useEffect(() => {
  //   applyFilters();
  // }, [applyFilters]); 

  // const handleApply = async (jobId) => {
  //   if (!user?.id_verified) {
  //     alert("Please verify your identity before applying for jobs");
  //     return;
  //   }

  //   try {
  //     await base44.entities.JobApplication.create({
  //       job_id: jobId,
  //       courier_id: user.id,
  //       message: "I'm interested in this delivery job and can handle it professionally."
  //     });
      
  //     // Get job details and notify customer
  //     const job = jobs.find(j => j.id === jobId);
  //     if (job) {
  //       await notifyJobApplication(job, user.full_name);
  //     }
      
  //     alert("Application submitted successfully!");
  //   } catch (error) {
  //     console.error("Error applying for job:", error);
  //     alert("Error submitting application. Please try again.");
  //   }
  // };

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  const handleApply = (jobId) => {
  console.log("Applied for job:", jobId);
  alert("Application submitted successfully!");
};
  

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Available Delivery Jobs</h1>
          <p className="text-slate-600">Find delivery jobs along your route and earn extra money</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters 
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* {isLoading ? (
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
            )} */}


          </div>
        </div>
      </div>
    </div>
  );
}