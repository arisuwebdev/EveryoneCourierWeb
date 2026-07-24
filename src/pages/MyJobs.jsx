import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Briefcase } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { getJob } from "../api/ApiServices/jobrelated/getJobService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function MyJobs() {
  const [myPostings, setMyPostings] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState(" ");
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeTab) return;

    setCurrentPage(1);

    if (activeTab === "postings") {
      setMyPostings([]);
    } else {
      setMyDeliveries([]);
    }

    fetchJobs(activeTab, 1);
  }, [activeTab]);

  useEffect(() => {
    if (!user) return;

    if (user.user_type === "CUSTOMER") {
      setActiveTab("postings");
    } else if (user.user_type === "COURIER") {
      setActiveTab("deliveries");
    } else if (user.user_type === "BOTH") {
      setActiveTab("postings"); // Default tab
    }
  }, [user]);

  const fetchJobs = async (type, page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await getJob(type, token, page);

      if (res.status === 1) {
        const jobs = res.payload.jobs || [];

        if (type === "postings") {
          setMyPostings((prev) => (page === 1 ? jobs : [...prev, ...jobs]));
        } else {
          setMyDeliveries((prev) => (page === 1 ? jobs : [...prev, ...jobs]));
        }

        setCurrentPage(res.payload.currentPage);
        setLastPage(res.payload.lastPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load jobs.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (
        scrollTop + windowHeight >= documentHeight - 200 &&
        currentPage < lastPage
      ) {
        fetchJobs(activeTab, currentPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, currentPage, lastPage, loading, loadingMore]);

  const renderJobList = (jobs, type) => {
    if (loading) {
      return (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      );
    }

    if (jobs.length === 0) {
      return (
        <p className="text-center text-slate-500 py-8">
          No jobs in this category.
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (
                user?.user_type === "CUSTOMER" ||
                user?.user_type === "BOTH"
              ) {
                if (job.status?.trim().toUpperCase() === "OPEN") {
                  navigate(`/my-jobs/${job.id}/applicants?type=postings`);
                } else {
                  navigate(`/my-jobs/${job.id}/assigned?type=postings`);
                }
              } else if (
                user?.user_type === "COURIER" ||
                user?.user_type === "BOTH"
              ) {
                navigate(`/my-jobs/${job.id}/assigned?type=deliveries`);
              }
            }}
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-slate-500">
                  {job.pickup_address} → {job.delivery_address}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-green-600">
                  ${Number(job.price).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 capitalize">
                  {job.status}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {loadingMore && (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Jobs</h1>
          <p className="text-slate-600">
            {user?.user_type === "CUSTOMER"
              ? "Manage your job postings."
              : user?.user_type === "COURIER"
                ? "Manage your assigned deliveries."
                : "Manage your job postings and deliveries."}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${
              user?.user_type === "BOTH" ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {(user?.user_type === "CUSTOMER" || user?.user_type === "BOTH") && (
              <TabsTrigger value="postings">
                <Briefcase className="w-4 h-4 mr-2" />
                My Postings
              </TabsTrigger>
            )}

            {(user?.user_type === "COURIER" || user?.user_type === "BOTH") && (
              <TabsTrigger value="deliveries">
                <Truck className="w-4 h-4 mr-2" />
                My Deliveries
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="postings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs You've Posted</CardTitle>
              </CardHeader>
              <CardContent>{renderJobList(myPostings, "postings")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs You're Delivering</CardTitle>
              </CardHeader>
              <CardContent>
                {renderJobList(myDeliveries, "deliveries")}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
