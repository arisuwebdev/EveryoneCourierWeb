// import { Card, CardContent } from "@/components/ui/card";
// import { Package } from "lucide-react";
// import JobCard from "../components/jobs/JobCard";
// import JobFilters from "../components/jobs/JobFilters";
// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../lib/AuthContext";
// import { findJob } from "../api/ApiServices/jobrelated/findJobService";
// // import { useNotificationTrigger } from "../components/notifications/useNotificationTrigger";

// export default function FindJobs() {
//   const { token, user } = useAuth();
//   const [jobs, setJobs] = useState([]);
  
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [filters, setFilters] = useState({
//     location: "",
//     packageSize: "all",
//     minPrice: "",
//     maxPrice: "",
//     urgent: false,
//   });

//   const applyFilters = useCallback(() => {
//     let filtered = jobs;

//     if (filters.location) {
//       filtered = filtered.filter(
//         (job) =>
//           job.pickup_address
//             .toLowerCase()
//             .includes(filters.location.toLowerCase()) ||
//           job.delivery_address
//             .toLowerCase()
//             .includes(filters.location.toLowerCase()),
//       );
//     }

//     if (filters.packageSize !== "all") {
//       filtered = filtered.filter(
//         (job) => job.package_size === filters.packageSize,
//       );
//     }

//     if (filters.minPrice) {
//       filtered = filtered.filter(
//         (job) => job.price >= parseFloat(filters.minPrice),
//       );
//     }

//     if (filters.maxPrice) {
//       filtered = filtered.filter(
//         (job) => job.price <= parseFloat(filters.maxPrice),
//       );
//     }

//     if (filters.urgent) {
//       filtered = filtered.filter((job) => job.urgent);
//     }

//     setFilteredJobs(filtered);
//   }, [jobs, filters]);

//   // const handleApply = (jobId) => {
//   // };

//   const handleApply = async (jobId) => {
//     // Remove immediately
//     setJobs((prev) => prev.filter((job) => job.id !== jobId));
//     setFilteredJobs((prev) => prev.filter((job) => job.id !== jobId));

//     // Refresh in background (optional)
//     loadJobs();
//   };

//   const loadJobs = async () => {
//     if (!token) return;

//     setIsLoading(true);

//     try {
//       const params = {};

//       if (filters.location) params.location = filters.location;

//       if (filters.packageSize !== "all")
//         params.package_size = filters.packageSize.toUpperCase();

//       if (filters.minPrice) params.price_min = filters.minPrice;

//       if (filters.maxPrice) params.price_max = filters.maxPrice;

//       if (filters.urgent) params.urgent = 1;

//       const res = await findJob(params, token);

//       setJobs(res.payload.jobs || []);
//       setFilteredJobs(res.payload.jobs || []);
//     } catch (error) {
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     loadJobs();
//   }, [filters]);

//   //---keep check api every 30 sec

// //   useEffect(() => {
// //   loadJobs();

// //   const interval = setInterval(() => {
// //     loadJobs();
// //   }, 10000);

// //   return () => clearInterval(interval);
// // }, [filters]);

//   return (
//     <div className="min-h-screen p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-slate-900 mb-2">
//             Available Delivery Jobs
//           </h1>
//           <p className="text-slate-600">
//             Find delivery jobs along your route and earn extra money
//           </p>
//         </div>

//         <div className="grid lg:grid-cols-4 gap-8">
//           {/* Filters Sidebar */}
//           <div className="lg:col-span-1">
//             <JobFilters filters={filters} setFilters={setFilters} />
//           </div>

//           {/* Jobs List */}
//           <div className="lg:col-span-3">
//             {isLoading ? (
//               <div className="min-h-[400px] flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                   <p className="mt-4 text-gray-600">Loading jobs...</p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="flex justify-between items-center mb-6">
//                   <p className="text-slate-600">
//                     {filteredJobs.length} job
//                     {filteredJobs.length !== 1 ? "s" : ""} available
//                   </p>
//                 </div>

//                 <div className="grid gap-6">
//                   {filteredJobs.map((job) => (
//                     <JobCard
//                       key={job.id}
//                       job={job}
//                       onApply={handleApply}
//                       userVerified={user?.id_verified}
//                       userType={user?.user_type}
//                     />
//                   ))}

//                   {filteredJobs.length === 0 && (
//                     <Card className="text-center py-12">
//                       <CardContent>
//                         <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
//                         <h3 className="text-lg font-medium text-slate-900 mb-2">
//                           No jobs found
//                         </h3>
//                         <p className="text-slate-600">
//                           Try adjusting your filters or check back later for new
//                           opportunities
//                         </p>
//                       </CardContent>
//                     </Card>
//                   )}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { findJob } from "../api/ApiServices/jobrelated/findJobService";
// import { useNotificationTrigger } from "../components/notifications/useNotificationTrigger";

export default function FindJobs() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    packageSize: "all",
    minPrice: "",
    maxPrice: "",
    urgent: false,
  });

  const sentinelRef = useRef(null);

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
  }, [jobs, filters]);

  const handleApply = async (jobId) => {
    // Remove immediately
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setFilteredJobs((prev) => prev.filter((job) => job.id !== jobId));

    // Refresh in background (optional)
    loadJobs(1, false);
  };

  const buildParams = useCallback(
    (pageNum) => {
      const params = { page: pageNum };

      if (filters.location) params.location = filters.location;

      if (filters.packageSize !== "all")
        params.package_size = filters.packageSize.toUpperCase();

      if (filters.minPrice) params.price_min = filters.minPrice;

      if (filters.maxPrice) params.price_max = filters.maxPrice;

      if (filters.urgent) params.urgent = 1;

      return params;
    },
    [filters],
  );

  // pageNum: which page to fetch. append: whether to add to existing jobs or replace them
  const loadJobs = async (pageNum = 1, append = false) => {
    if (!token) return;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = buildParams(pageNum);

      const res = await findJob(params, token);
      const newJobs = res.payload.jobs || [];
      const lastPage = res.payload.lastPage ?? 1;
      const currentPage = res.payload.currentPage ?? pageNum;

      setJobs((prev) => {
        const combined = append ? [...prev, ...newJobs] : newJobs;
        return combined;
      });

      setPage(currentPage);
      setHasMore(currentPage < lastPage);
    } catch (error) {
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setHasMore(true);
    loadJobs(1, false);
  }, [filters]);

  // Keep filteredJobs in sync with jobs/filters (client-side filtering on top of loaded pages)
  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  // Infinite scroll: observe sentinel, load next page when it comes into view
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadJobs(page + 1, true);
        }
      },
      { rootMargin: "200px" }, // start loading a bit before it's fully visible
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [page, hasMore, isLoading, isLoadingMore, filters]);

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
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading jobs...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-slate-600">
                    {filteredJobs.length} job
                    {filteredJobs.length !== 1 ? "s" : ""} available
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
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          No jobs found
                        </h3>
                        <p className="text-slate-600">
                          Try adjusting your filters or check back later for new
                          opportunities
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sentinel for infinite scroll */}
                  {filteredJobs.length > 0 && (
                    <div ref={sentinelRef} className="h-4" />
                  )}

                  {isLoadingMore && (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}

                  {/* {!hasMore && filteredJobs.length > 0 && (
                    <p className="text-center text-sm text-slate-400 py-4">
                      You've reached the end of the list
                    </p>
                  )} */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}