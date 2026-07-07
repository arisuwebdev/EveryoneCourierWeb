import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, MapPin, Package, DollarSign, Star, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import JobStatusStepper from "./JobStatusStepper";
import { useNotificationTrigger } from "../notifications/useNotificationTrigger";
import CourierTracker from "../tracking/CourierTracker";
import CustomerTrackingMap from "../tracking/CustomerTrackingMap";
// import { stripeTransferPayout } from "@/functions/stripeTransferPayout";
import ReviewModal from "../reviews/ReviewModal";

function StarRating({ rating, setRating }) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star className={`w-8 h-8 ${star <= (hovered || rating) ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  );
}

function DeliveredSection({ job, isCustomer, courier, currentUser, hasReviewed, onReviewed }) {
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    await base44.entities.Review.create({
      job_id: job.id,
      customer_id: currentUser.id,
      courier_id: job.courier_id,
      rating,
      comment,
    });
    // Update courier's average rating
    const allReviews = await base44.entities.Review.filter({ courier_id: job.courier_id });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await base44.entities.User.update(job.courier_id, { rating: parseFloat(avg.toFixed(2)) });
    setIsSubmitting(false);
    onReviewed();
  };

  if (!isCustomer) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Delivery Complete!</p>
        <p className="text-sm text-green-600 mt-1">Waiting for the customer to leave a review.</p>
      </div>
    );
  }

  if (hasReviewed) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Thanks for your review!</p>
        <p className="text-sm text-green-600 mt-1">Your feedback helps build trust in the network.</p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        <p className="font-semibold text-slate-800">Rate your delivery experience</p>
      </div>
      {courier && (
        <p className="text-sm text-slate-600">How did <strong>{courier.full_name}</strong> do?</p>
      )}
      <StarRating rating={rating} setRating={setRating} />
      {rating > 0 && (
        <p className="text-xs text-slate-500">{["","Poor","Fair","Good","Very Good","Excellent"][rating]}</p>
      )}
      <Textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Leave a comment about your experience (optional)..."
        className="h-20 bg-white"
      />
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
}

export default function AssignedJobView({ job, currentUser, onBack }) {
  const [otherUser, setOtherUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [courier, setCourier] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [jobStatus, setJobStatus] = useState(job.status);
  const isCustomer = currentUser.id === job.customer_id;
  
  const { notifyJobCompleted } = useNotificationTrigger();
  
  useEffect(() => {
    const loadUsers = async () => {
      const otherUserId = isCustomer ? job.courier_id : job.customer_id;
      if (otherUserId) {
        const users = await base44.entities.User.list();
        const user = users.find(u => u.id === otherUserId);
        setOtherUser(user);
      }
      
      // Load both customer and courier for notifications
      const allUsers = await base44.entities.User.list();
      const customerData = allUsers.find(u => u.id === job.customer_id);
      const courierData = allUsers.find(u => u.id === job.courier_id);
      setCustomer(customerData);
      setCourier(courierData);

      // Check if customer already reviewed this job
      if (isCustomer && job.status === 'delivered') {
        const existing = await base44.entities.Review.filter({ job_id: job.id, customer_id: currentUser.id });
        setHasReviewed(existing.length > 0);
      }
    };
    loadUsers();
  }, [job, isCustomer, currentUser.id]);

  const updateJobStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await base44.entities.DeliveryJob.update(job.id, { status: newStatus });
      
      // If delivery is complete, update courier's stats and notify
      if (newStatus === 'delivered') {
        const courierData = courier || await base44.entities.User.list().then(users => users.find(u => u.id === job.courier_id));
        if (courierData) {
          await base44.entities.User.update(job.courier_id, {
            completed_deliveries: (courierData.completed_deliveries || 0) + 1
          });
        }
        
        // Send notifications
        if (customer && courier) {
          await notifyJobCompleted(job, customer.full_name, courier.full_name);
        }
        
        // Trigger Stripe payout transfer to courier if not already a split payment
        const payments = await base44.entities.Payment.filter({ job_id: job.id });
        if (payments.length > 0) {
          const payment = payments[0];
          const courierUser = courierData;
          // Only do a manual transfer if no split was set at payment intent creation
          if (courierUser?.stripe_account_id && payment.transaction_id && !payment.split_payment) {
            const payoutCents = Math.round(payment.courier_payout * 100);
            await stripeTransferPayout({
              job_id: job.id,
              payment_intent_id: payment.transaction_id,
              courier_stripe_account_id: courierUser.stripe_account_id,
              courier_payout_cents: payoutCents,
            });
          }
          await base44.entities.Payment.update(payment.id, { payment_status: 'completed' });
        }
      }
      
      setJobStatus(newStatus);
      if (newStatus !== 'delivered') onBack();
    } catch (error) {
      console.error("Error updating job status:", error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Details: {job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <JobStatusStepper currentStatus={job.status} />

                {/* Location tracking — only when job is active */}
                {(jobStatus === 'assigned' || jobStatus === 'picked_up') && (
                  <div>
                    {!isCustomer ? (
                      <CourierTracker job={job} />
                    ) : (
                      <CustomerTrackingMap job={job} courierName={otherUser?.full_name} />
                    )}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Pickup</p>
                      <p className="text-slate-900">{job.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Delivery</p>
                      <p className="text-slate-900">{job.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Package</p>
                      <p className="text-slate-900">{job.package_description}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">Payment</p>
                      <p className="font-bold text-slate-900">${job.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {jobStatus !== 'delivered' && jobStatus !== 'cancelled' && (
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Actions</h3>
                    <div className="flex gap-4">
                      {!isCustomer && job.status === 'assigned' && (
                        <Button onClick={() => updateJobStatus('picked_up')} disabled={isUpdating}>
                          Mark as Picked Up
                        </Button>
                      )}
                       {!isCustomer && job.status === 'picked_up' && (
                        <Button onClick={() => updateJobStatus('delivered')} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                          Mark as Delivered
                        </Button>
                      )}
                      {/* Customer can cancel before pickup */}
                      {isCustomer && job.status === 'assigned' && (
                         <Button variant="destructive" onClick={() => updateJobStatus('cancelled')} disabled={isUpdating}>
                          Cancel Job
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {jobStatus === 'delivered' && (
                  <DeliveredSection
                    job={job}
                    isCustomer={isCustomer}
                    courier={courier}
                    currentUser={currentUser}
                    hasReviewed={hasReviewed}
                    onReviewed={() => setHasReviewed(true)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isCustomer ? 'Your Courier' : 'Your Customer'}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {otherUser ? (
                  <>
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={otherUser.avatar_url} />
                      <AvatarFallback>{otherUser.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold">{otherUser.full_name}</p>
                    <p className="text-sm text-slate-500">{otherUser.email}</p>
                    <div className="flex justify-center gap-2 mt-4">
                      <Button variant="outline" size="icon"><Mail className="w-4 h-4"/></Button>
                      <Button variant="outline" size="icon"><Phone className="w-4 h-4"/></Button>
                    </div>
                  </>
                ) : (
                  <p>Loading...</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}