import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Package,
  DollarSign,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import { getJobDetails } from "../../api/ApiServices/jobrelated/getJobDetailsService";
import { toast } from "react-toastify";

import JobStatusStepper from "./JobStatusStepper";
import { useNotificationTrigger } from "../notifications/useNotificationTrigger";
import CourierTracker from "../tracking/CourierTracker";
import CustomerTrackingMap from "../tracking/CustomerTrackingMap";
import { updateJobStatus } from "../../api/ApiServices/jobstatusupdate/updateJobStatusService";
import { customerSaveReview } from "../../api/ApiServices/jobstatusupdate/customerSaveJobReviewService";

// Statuses as returned by the API (uppercase enum values)
const STATUS = {
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

function StarRating({ rating, setRating }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hovered || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function DeliveredSection({
  jobId,
  token,
  isCustomer,
  courierName,
  hasReviewed,
  onReviewed,
  rating,
  review,
  reviewJustSubmitted,
  setReviewJustSubmitted,
}) {
  // const [rating, setRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      const payload = {
        job_id: jobId,
        rating: selectedRating,
        review: comment || "",
      };

      const res = await customerSaveReview(payload, token);

      if (res.status !== 1) {
        toast.error(res.msg || "Failed to submit review.");
        return;
      }

      toast.success(res.msg || "Review submitted successfully.");
      setReviewJustSubmitted(true);

      await onReviewed();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCustomer) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />

        {hasReviewed ? (
          <>
            <p className="font-semibold text-green-700">
              {reviewJustSubmitted
                ? "Customer has reviewed your delivery!"
                : "Delivery Completed"}
            </p>

            <p className="text-sm text-green-600 mt-1">
              {reviewJustSubmitted
                ? "Thank you for completing this delivery."
                : "The customer has already reviewed this delivery."}
            </p>

            <div className="mt-3">
              <p className="font-medium">⭐ {Number(rating).toFixed(1)}/5</p>

              {review && (
                <p className="text-slate-600 italic mt-2">"{review}"</p>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="font-semibold text-green-700">Delivery Complete!</p>

            <p className="text-sm text-green-600 mt-1">
              Waiting for the customer to leave a review.
            </p>
          </>
        )}
      </div>
    );
  }

  if (isCustomer && reviewJustSubmitted) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Thanks for your review!</p>
        <p className="text-sm text-green-600 mt-1">
          Your feedback helps build trust in the network.
        </p>
      </div>
    );
  }

  if (isCustomer && hasReviewed) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="font-semibold text-green-700">Delivery Completed</p>
        <p className="text-sm text-green-600 mt-1">
          You have already submitted your review.
        </p>

        {/* <p className="mt-3 font-medium">
        ⭐ {Number(rating).toFixed(1)}/5
      </p>

      {review && (
        <p className="text-slate-600 italic mt-2">
          "{review}"
        </p>
      )} */}
      </div>
    );
  }

  return (
    <div className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border border-amber-200 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        <p className="font-semibold text-slate-800">
          Rate your delivery experience
        </p>
      </div>
      {courierName && (
        <p className="text-sm text-slate-600">
          How did <strong>{courierName}</strong> do?
        </p>
      )}
      <StarRating rating={selectedRating} setRating={setSelectedRating} />
      {rating > 0 && (
        <p className="text-xs text-slate-500">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
        </p>
      )}
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
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

export default function AssignedJobView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const { notifyJobCompleted } = useNotificationTrigger();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(id, type, token);
      if (res.status === 1) {
        setJob(res.payload.job);
      } else {
        toast.error(res.msg);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [id, type, token]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Job not found.</p>
        </div>
      </div>
    );
  }
  const isCustomer = String(currentUser?.user_id) === String(job.customer_id);

  const isCourier = String(currentUser?.user_id) === String(job.courier_id);

  const hasReviewed = Boolean(job?.customer_reviewed_at);
  const price = parseFloat(job.price) || 0;

  const PostupdateJobStatus = async (newStatus) => {
    setIsUpdating(true);

    try {
      const payload = {
        job_id: job.id, // or job.job_id depending on your API response
        status: newStatus,
      };

      const res = await updateJobStatus(payload, token);

      if (res.status !== 1) {
        toast.error(res.msg || "Failed to update job status.");
        return;
      }

      if (newStatus === STATUS.DELIVERED && job.customer && job.courier) {
        await notifyJobCompleted(
          job,
          job.customer.full_name,
          job.courier.full_name,
        );
      }

      setJob((prev) => ({
        ...prev,
        status: newStatus,
      }));

      toast.success(res.msg || "Job status updated successfully.");

      if (newStatus !== STATUS.DELIVERED) {
        navigate(-1);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update job status.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
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

                {(job.status === STATUS.ASSIGNED ||
                  job.status === STATUS.PICKED_UP) && (
                  <div>
                    {isCourier ? (
                      <CourierTracker job={job} />
                    ) : (
                      <CustomerTrackingMap
                        job={job}
                        courierName={job.courier_name}
                      />
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Pickup
                      </p>
                      <p className="text-slate-900">{job.pickup_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Delivery
                      </p>
                      <p className="text-slate-900">{job.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Package
                      </p>
                      <p className="text-slate-900">
                        {job.package_description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Payment
                      </p>
                      <p className="font-bold text-slate-900">
                        ${price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {job.status !== STATUS.DELIVERED &&
                  job.status !== STATUS.CANCELLED && (
                    <div className="pt-6 border-t">
                      <h3 className="font-semibold mb-4">Actions</h3>
                      <div className="flex gap-4">
                        {isCourier && job.status === STATUS.ASSIGNED && (
                          <Button
                            onClick={() =>
                              PostupdateJobStatus(STATUS.PICKED_UP)
                            }
                            disabled={isUpdating}
                          >
                            Mark as Picked Up
                          </Button>
                        )}
                        {isCourier && job.status === STATUS.PICKED_UP && (
                          <Button
                            onClick={() =>
                              PostupdateJobStatus(STATUS.DELIVERED)
                            }
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}
                        {isCustomer && job.status === STATUS.ASSIGNED && (
                          <Button
                            variant="destructive"
                            onClick={() =>
                              PostupdateJobStatus(STATUS.CANCELLED)
                            }
                            disabled={isUpdating}
                          >
                            Cancel Job
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                {job.status === STATUS.DELIVERED && (
                  <DeliveredSection
                    jobId={job.id}
                    token={token}
                    isCustomer={isCustomer}
                    courierName={job.courier_name}
                    hasReviewed={hasReviewed}
                    rating={job.customer_given_rating}
                    review={job.customer_given_review}
                    onReviewed={fetchJobDetails}
                    reviewJustSubmitted={reviewJustSubmitted}
                    setReviewJustSubmitted={setReviewJustSubmitted}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCustomer ? "Your Courier" : "Your Customer"}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarFallback>
                    {(isCustomer
                      ? job.courier_name
                      : job.customer_name
                    )?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <p className="font-bold">
                  {isCustomer ? job.courier_name : job.customer_name}
                </p>

                <p className="text-sm text-slate-500">
                  {isCustomer ? job.courier_email : job.customer_email}
                </p>

                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="icon">
                    <Mail className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="icon">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
