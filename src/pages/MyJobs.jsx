// import React, { useState, useEffect } from "react";
// import { DeliveryJob, JobApplication, User } from "@/entities/all";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Briefcase } from "lucide-react";

import ApplicantList from "../components/jobs/ApplicantList";
import AssignedJobView from "../components/jobs/AssignedJobView";

export default function MyJobs() {
  // const [user, setUser] = useState(null);
  const [myPostings, setMyPostings] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [selectedJob, setSelectedJob] = useState(null);

  // const loadJobsData = React.useCallback(async (currentUser) => {
  //   setIsLoading(true);
  //   try {
  //     // Jobs posted by the user
  //     const postings = await DeliveryJob.filter({ customer_id: currentUser.id }, '-created_date');
  //     setMyPostings(postings);

  //     // Jobs the user has applied for or is delivering
  //     const applications = await JobApplication.filter({ courier_id: currentUser.id });
  //     const jobIds = applications.map(app => app.job_id);
  //     const assignedJobs = await DeliveryJob.filter({ courier_id: currentUser.id });
  //     jobIds.push(...assignedJobs.map(job => job.id));

  //     if (jobIds.length > 0) {
  //       const deliveryJobs = await DeliveryJob.filter({ id: { $in: jobIds } }, '-created_date');
  //       setMyDeliveries(deliveryJobs);
  //     }
  //   } catch (error) {
  //     console.error("Error loading jobs data:", error);
  //   }
  //   setIsLoading(false);
  // }, []);

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const currentUser = await User.me();
  //       setUser(currentUser);
  //       loadJobsData(currentUser);
  //     } catch (error) {
  //       // Not logged in
  //       setIsLoading(false);
  //     }
  //   };
  //   init();
  // }, [loadJobsData]);

  // const handleJobSelect = (job) => {
  //   setSelectedJob(job);
  // };

  // const handleBackToList = () => {
  //   setSelectedJob(null);
  //   if(user) loadJobsData(user);
  // };

  const renderJobList = (jobs) => (
    <div className="space-y-4">
      {jobs.map((job) => (
        // <Card
        //   key={job.id}
        //   className="cursor-pointer hover:shadow-md transition-shadow"
        //   onClick={() => handleJobSelect(job)}
        // >

        <Card key={job.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm text-slate-500">
                {job.pickup_address} → {job.delivery_address}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-green-600">
                ${job.price.toFixed(2)}
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

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <p>Please log in to see your jobs.</p>
  //     </div>
  //   );
  // }

  // if (selectedJob) {
  //   if (selectedJob.status === "open" && selectedJob.customer_id === user.id) {
  //     return <ApplicantList job={selectedJob} onBack={handleBackToList} />;
  //   }
  //   return (
  //     <AssignedJobView
  //       job={selectedJob}
  //       currentUser={user}
  //       onBack={handleBackToList}
  //     />
  //   );
  // }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Jobs</h1>
          <p className="text-slate-600">
            Manage your job postings and deliveries
          </p>
        </div>

        <Tabs defaultValue="postings" className="w-full">
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
              <CardContent>{renderJobList(myPostings)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Jobs You're Delivering</CardTitle>
              </CardHeader>
              <CardContent>{renderJobList(myDeliveries)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
