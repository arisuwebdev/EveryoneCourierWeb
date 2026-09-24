import { Card, CardContent } from "@/components/ui/card";
import { Package, Loader2 } from "lucide-react";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../lib/AuthContext";
import { findJob } from "../api/ApiServices/jobrelated/findJobService";
import { appliedJobApplied } from "../api/ApiServices/jobrelated/appliedJobAppliedService";
import ChatBox from "../components/jobs/ChatBox";
// import { useNotificationTrigger } from "../components/notifications/useNotificationTrigger";

export default function FindJobs() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isLoadingApplied, setIsLoadingApplied] = useState(false);
  const [appliedLoaded, setAppliedLoaded] = useState(false);

  // for pagination
  const [appliedPage, setAppliedPage] = useState(1);
  const [appliedLastPage, setAppliedLastPage] = useState(1);
  const [isLoadingMoreApplied, setIsLoadingMoreApplied] = useState(false);
const [appliedTotal, setAppliedTotal] = useState(0);
  const appliedSentinelRef = useRef(null);
  const [selectedChatJob, setSelectedChatJob] = useState(null);
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

  // const handleApply = async (jobId) => {
  //   setJobs((prev) => prev.filter((job) => job.id !== jobId));

  //   setFilteredJobs((prev) => prev.filter((job) => job.id !== jobId));

  //   await loadJobs(1, false);

  //   // Refresh applied jobs if they have already been loaded
  //   if (appliedLoaded) {
  //     await loadAppliedJobs();
  //   }
  // };

  const handleApply = async (jobId) => {
    // Call findJob API again and refresh Available Jobs
    await loadJobs(1, false);

    // Refresh Applied Jobs if already loaded
    if (appliedLoaded) {
      await loadAppliedJobs();
    }
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

  // this is function use for applied job
  const loadAppliedJobs = async (pageNum = 1, append = false) => {
    if (!token) return;

    if (append) {
      setIsLoadingMoreApplied(true);
    } else {
      setIsLoadingApplied(true);
    }

    try {
      const res = await appliedJobApplied(
        {
          page: pageNum,
        },
        token,
      );

      const newAppliedJobs = res?.payload?.jobs || [];

      const formattedJobs = newAppliedJobs.map((job) => ({
        ...job,
        id: job.id || job.job_id,
      }));

      setAppliedJobs((prev) =>
        append ? [...prev, ...formattedJobs] : formattedJobs,
      );

      setAppliedPage(res?.payload?.currentPage ?? pageNum);
      setAppliedLastPage(res?.payload?.lastPage ?? 1);
      setAppliedTotal(res?.payload?.total ?? 0);


      setAppliedLoaded(true);
    } catch (error) {
      // console.error("Failed to load applied jobs:", error);

      if (!append) {
        setAppliedJobs([]);
      }
    } finally {
      setIsLoadingApplied(false);
      setIsLoadingMoreApplied(false);
    }
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setHasMore(true);
    loadJobs(1, false);
  }, [filters]);

  useEffect(() => {
    if (token) {
      loadAppliedJobs();
    }
  }, [token]);

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

  // Infinite scroll for Applied Jobs
  useEffect(() => {
    if (activeTab !== "applied") return;
    if (!appliedSentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (
          entry.isIntersecting &&
          appliedPage < appliedLastPage &&
          !isLoadingApplied &&
          !isLoadingMoreApplied
        ) {
          loadAppliedJobs(appliedPage + 1, true);
        }
      },
      {
        rootMargin: "200px",
      },
    );

    observer.observe(appliedSentinelRef.current);

    return () => observer.disconnect();
  }, [
    activeTab,
    appliedPage,
    appliedLastPage,
    isLoadingApplied,
    isLoadingMoreApplied,
  ]);

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
                <div className="flex items-center justify-between mb-6 border-b border-slate-200">
                  <div className="flex gap-6">
                    <button
                      type="button"
                      onClick={() => setActiveTab("available")}
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "available"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Available Jobs ({filteredJobs.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("applied");

                        if (!appliedLoaded) {
                          loadAppliedJobs();
                        }
                      }}
                      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "applied"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Applied Jobs ({appliedTotal})
                    </button>
                  </div>
                </div>

                <div className="grid gap-6">
                  {activeTab === "available" ? (
                    <>
                      {filteredJobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onApply={handleApply}
                          isApplied={false}
                          onChat={() => setSelectedChatJob(job)}
                          userVerified={user?.id_verified}
                          userType={user?.user_type}
                        />
                      ))}

                      {selectedChatJob && (
                        <Card className="mt-6 overflow-hidden border-blue-200 shadow-lg">
                          <CardContent className="p-0">
                            <ChatBox
                              jobId={selectedChatJob.id}
                              currentUserId={user?.id}
                              receiverId={
                                selectedChatJob.customer_id ||
                                selectedChatJob.customer?.id
                              }
                              otherUserName={
                                selectedChatJob.customer_name ||
                                selectedChatJob.customer?.name ||
                                "Customer"
                              }
                              jobPrice={selectedChatJob.price}
                              agreedPrice={
                                selectedChatJob.agreed_price ??
                                selectedChatJob.final_price ??
                                null
                              }
                              jobStatus={selectedChatJob.status}
                              userType={user?.user_type}
                            />

                            <div className="border-t p-3">
                              <button
                                type="button"
                                onClick={() => setSelectedChatJob(null)}
                                className="text-sm text-slate-500 hover:text-slate-700"
                              >
                                Close Chat
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {filteredJobs.length === 0 && (
                        <Card className="text-center py-12">
                          <CardContent>
                            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />

                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                              No jobs found
                            </h3>

                            <p className="text-slate-600">
                              Try adjusting your filters or check back later for
                              new opportunities
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {filteredJobs.length > 0 && (
                        <div ref={sentinelRef} className="h-4" />
                      )}

                      {isLoadingMore && (
                        <div className="flex justify-center py-6">
                          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {isLoadingApplied ? (
                        <div className="min-h-[300px] flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />

                            <p className="mt-4 text-gray-600">
                              Loading applied jobs...
                            </p>
                          </div>
                        </div>
                      ) : appliedJobs.length > 0 ? (
                        <>
                          {appliedJobs.map((job) => (
                            <JobCard
                              key={job.id}
                              job={job}
                              isApplied={true}
                              onChat={() => setSelectedChatJob(job)}
                              userVerified={user?.id_verified}
                              userType={user?.user_type}
                            />
                          ))}

                          {/* Applied Jobs infinite scroll sentinel */}
                          {appliedPage < appliedLastPage && (
                            <div
                              ref={appliedSentinelRef}
                              className="h-10 flex justify-center items-center"
                            >
                              {isLoadingMoreApplied && (
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                              )}
                            </div>
                          )}

                          {appliedPage >= appliedLastPage && (
                            <div className="text-center py-6 text-sm text-slate-500">
                              No more applied jobs
                            </div>
                          )}
                        </>
                      ) : (
                        <Card className="text-center py-12">
                          <CardContent>
                            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />

                            <h3 className="text-lg font-medium text-slate-900 mb-2">
                              No applied jobs
                            </h3>

                            <p className="text-slate-600">
                              You haven't applied for any jobs yet.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
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
