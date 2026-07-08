import React, { useState, useEffect } from "react";
// import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ArrowLeft, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationTrigger } from "../notifications/useNotificationTrigger";

export default function ApplicantList({ job, onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [customer, setCustomer] = useState(null);
  
  const { notifyJobAssigned } = useNotificationTrigger();

 useEffect(() => {
  // No backend available
  setApplicants([]);
  setCustomer(null);
  setIsLoading(false);
}, []);

const handleAssignCourier = async (application) => {
  setIsAssigning(true);

  try {
    console.log("Assign courier:", application);

    // Notification placeholder
    await notifyJobAssigned(
      job,
      customer?.full_name || "Customer",
      application?.courier?.full_name || "Courier"
    );

    alert(
      `Courier ${application?.courier?.full_name || ""} assigned successfully!`
    );

    onBack();
  } catch (error) {
    console.error(error);
  }

  setIsAssigning(false);
};

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Jobs
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Applicants for "{job.title}"</CardTitle>
          </CardHeader>
          <CardContent>
            {applicants.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No one has applied for this job yet.</p>
            ) : (
              <div className="space-y-4">
                {applicants.map(app => (
                  <Card key={app.id} className="p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={app.courier?.avatar_url} />
                          <AvatarFallback>
                            {app.courier?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{app.courier?.full_name}</p>
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{app.courier?.rating?.toFixed(1) || 'New'}</span>
                            <span>({app.courier?.completed_deliveries || 0} jobs)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2 flex flex-col justify-between">
                        <p className="text-slate-700 italic bg-slate-50 p-3 rounded-md">"{app.message}"</p>
                        
                        <div className="flex items-center justify-end gap-2 mt-2">
                           {app.courier?.id_verified && <Badge variant="secondary" className="text-green-700 bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>}
                           <Button 
                             onClick={() => handleAssignCourier(app)} 
                             disabled={isAssigning}
                             className="bg-green-600 hover:bg-green-700"
                           >
                             {isAssigning ? 'Assigning...' : 'Assign Courier'}
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