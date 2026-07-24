import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationTrigger } from "../notifications/useNotificationTrigger";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { getJobApplicants } from "../../api/ApiServices/jobrelated/getJobApplicationService";
import { toast } from "react-toastify";
import { getAssignJob } from "../../api/ApiServices/jobrelated/getAssignJobService";

export default function ApplicantList() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
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

      const res = await getJobApplicants(id, token);

      if (res.status === 1) {
        setJob(res.payload.job);
        setApplicants(res.payload.applications || []);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to load applicants.");
    } finally {
      setIsLoading(false);
    }
  };

const handleAssignCourier = async (application) => {
  try {
    setIsAssigning(true);

    const res = await getAssignJob(job.id, application.id, token);

    if (res.status === 1) {
      toast.success(res.msg || "Courier assigned successfully!");

      navigate("/my-jobs");
    } else {
      toast.error(res.msg || "Failed to assign courier.");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.response?.data?.msg || "Failed to assign courier.");
  } finally {
    setIsAssigning(false);
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
              <p className="text-center text-slate-500 py-8">
                No one has applied for this job yet.
              </p>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <Card key={app.id} className="p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={app.courier?.avatar_url} />
                          <AvatarFallback>
                            {app.courier?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{app.courier?.name}</p>
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
                          "{app.message}"
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
                          <Button
                            onClick={() => handleAssignCourier(app)}
                            disabled={isAssigning}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isAssigning ? "Assigning..." : "Assign Courier"}
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
