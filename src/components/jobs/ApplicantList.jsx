import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft, CheckCircle,MapPin,Package,Scale, Ruler , Truck , AlertCircle,Calendar,DollarSign} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationTrigger } from "../notifications/useNotificationTrigger";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { getJobApplicants } from "../../api/ApiServices/jobrelated/getJobApplicationService";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { getAssignJob } from "../../api/ApiServices/jobrelated/getAssignJobService";
import { getJobDetails } from "../../api/ApiServices/jobrelated/getJobDetailsService";

export default function ApplicantList() {
  const [isLoading, setIsLoading] = useState(true);
  // const [isAssigning, setIsAssigning] = useState(false);
  const [assigningApplicantId, setAssigningApplicantId] = useState(null);
  const [customer, setCustomer] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const { notifyJobAssigned } = useNotificationTrigger();

  useEffect(() => {
    fetchApplicants();
  }, [id]);

  const fetchApplicants = async () => {
    try {
      setIsLoading(true);

      // First API: check applicants
      const res = await getJobApplicants(id, token);

      if (res.status === 1) {
        const applications = res.payload.applications || [];

        setApplicants(applications);

        // Job information from first API
        setJob(res.payload.job);

        // No applicants → call getJobDetails API
        if (applications.length === 0) {
          try {
            const detailsRes = await getJobDetails(id, "customer", token);

            if (detailsRes.status === 1) {
              setJob(detailsRes.payload.job);
            } else {
              toast.error(detailsRes.msg || "Failed to load job details.");
            }
          } catch (error) {
            toast.error(
              error.response?.data?.msg || "Failed to load job details.",
            );
          }
        }
      } else {
        toast.error(res.msg || "Failed to load applicants.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load applicants.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleAssignCourier = async (application) => {
  //   try {
  //     setIsAssigning(true);

  //     const res = await getAssignJob(job.id, application.id, token);

  //     if (res.status === 1) {
  //       toast.success(res.msg || "Courier assigned successfully!");

  //       navigate("/my-jobs");
  //     } else {
  //       toast.error(res.msg || "Failed to assign courier.");
  //     }
  //   } catch (error) {

  //     toast.error(error.response?.data?.msg || "Failed to assign courier.");
  //   } finally {
  //     setIsAssigning(false);
  //   }
  // };

  const handleAssignCourier = async (application) => {
    try {
      setAssigningApplicantId(application.id);

      const res = await getAssignJob(job.id, application.id, token);

      if (res.status === 1) {
        toast.success(res.msg || "Courier assigned successfully!");

        navigate("/my-jobs");
      } else {
        toast.error(res.msg || "Failed to assign courier.");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to assign courier.");
    } finally {
      setAssigningApplicantId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate("/my-jobs")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Jobs
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Applicants for "{job.title}"</CardTitle>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <div className="space-y-6">
                {/* No Applicants Message */}
                <div className="text-center py-4">
                  <p className="text-lg font-semibold text-slate-700">
                    No one has applied for this job yet.
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Here are the details of your job.
                  </p>
                </div>

                {/* Job Details */}
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Pickup */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />

                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Pickup
                          </p>

                          <p className="text-slate-900">
                            {job?.pickup_address || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* Delivery */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-500 mt-0.5" />

                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Delivery
                          </p>

                          <p className="text-slate-900">
                            {job?.delivery_address || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* Package */}
                      <div className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-purple-500 mt-0.5" />

                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            Package
                          </p>

                          <p className="text-slate-900">
                            {job?.package_description || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* Job Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Weight */}
                        <div className="flex items-start gap-3">
                          <Scale className="w-5 h-5 text-orange-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Weight (kg)
                            </p>

                            <p className="text-slate-900">
                              {job?.weight || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Dimensions */}
                        <div className="flex items-start gap-3">
                          <Ruler className="w-5 h-5 text-indigo-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Dimensions (L x W x H cm)
                            </p>

                            <p className="text-slate-900">
                              {job?.dimensions || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Package Size */}
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-purple-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Package Size
                            </p>

                            <p className="text-slate-900 font-medium">
                              {job?.package_size || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-blue-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Vehicle Required
                            </p>

                            <p className="text-slate-900 font-medium">
                              {job?.vehicle_required || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Urgent */}
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Urgent
                            </p>

                            <p className="text-slate-900 font-medium">
                              {job?.urgent ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>

                        {/* Pickup Date */}
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Pickup Date
                            </p>

                            <p className="text-slate-900">
                              {job?.pickup_date
                                ? format(
                                    new Date(job.pickup_date),
                                    "MMM d, yyyy",
                                  )
                                : "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Delivery Date */}
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-green-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Delivery Date
                            </p>

                            <p className="text-slate-900">
                              {job?.delivery_date
                                ? format(
                                    new Date(job.delivery_date),
                                    "MMM d, yyyy",
                                  )
                                : "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 text-amber-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Payment
                            </p>

                            <p className="font-bold text-slate-900">
                              {job?.currency || "AUD"}{" "}
                              {Number(job?.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {job?.special_instructions && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />

                            <div>
                              <p className="text-sm font-semibold text-yellow-800">
                                Special Instructions
                              </p>

                              <p className="text-sm text-slate-700 mt-1">
                                {job.special_instructions}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <Card key={app.id} className="p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          className="w-16 h-16 cursor-pointer"
                          onClick={() =>
                            navigate(`/user-profile/${app.courier?.id}`)
                          }
                        >
                          <AvatarImage src={app.courier?.avatar_url} />

                          <AvatarFallback>
                            {app.courier?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p
                            className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            onClick={() =>
                              navigate(`/user-profile/${app.courier?.id}`)
                            }
                          >
                            {app.courier?.name}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>
                              {app.courier?.rating
                                ? Number(app.courier.rating).toFixed(1)
                                : "New"}
                            </span>
                            <span>
                              ({app.courier?.completed_deliveries || 0} jobs)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex flex-col justify-between">
                        <p className="text-slate-700 italic bg-slate-50 p-3 rounded-md">
                          {app.message ? (
                            `"${app.message}"`
                          ) : (
                            <span className="text-slate-400 not-italic">
                              No message provided
                            </span>
                          )}
                        </p>

                        <div className="flex items-center justify-end gap-2 mt-2">
                          {app.courier?.id_verified && (
                            <Badge
                              variant="secondary"
                              className="text-green-700 bg-green-100"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {/* <Button
                            onClick={() => handleAssignCourier(app)}
                            disabled={isAssigning}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isAssigning ? "Assigning..." : "Assign Courier"}
                          </Button> */}

                          <Button
                            onClick={() => handleAssignCourier(app)}
                            disabled={assigningApplicantId === app.id}
                            className={
                              assigningApplicantId === app.id
                                ? "bg-green-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }
                          >
                            {assigningApplicantId === app.id
                              ? "Assigning..."
                              : "Assign Courier"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
