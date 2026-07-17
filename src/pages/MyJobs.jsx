import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Briefcase } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { getJob } from "../api/ApiServices/jobrelated/getJobService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import ApplicantList from "../components/jobs/ApplicantList";
import AssignedJobView from "../components/jobs/AssignedJobView";

export default function MyJobs() {
  const [myPostings, setMyPostings] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("postings");
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs(activeTab);
  }, [activeTab]);

  const fetchJobs = async (type) => {
    try {
      const res = await getJob(type, token);

      if (res.status === 1) {
        if (type === "postings") {
          setMyPostings(res.payload.jobs || []);
        } else {
          setMyDeliveries(res.payload.jobs || []);
        }
      } else {
        toast.error(res.msg || "Failed to load jobs.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load jobs.");
    }
  };

  const renderJobList = (jobs, type) => (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card
          key={job.id}
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/my-jobs/${job.id}?type=${type}`)}
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
              <p className="text-xs text-slate-400 capitalize">{job.status}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {jobs.length === 0 && (
        <p className="text-center text-slate-500 py-8">
          No jobs in this category.
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Jobs</h1>
          <p className="text-slate-600">
            Manage your job postings and deliveries
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="postings">
              <Briefcase className="w-4 h-4 mr-2" /> My Postings
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              <Truck className="w-4 h-4 mr-2" /> My Deliveries
            </TabsTrigger>
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
