import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
  Weight,
  Ruler,
  Scale,
  Truck,
  AlertCircle,
  Calendar,
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
import { saveCourierReview } from "../../api/ApiServices/jobstatusupdate/saveCourierReviewService";
import ChatBox from "./ChatBox";
import { confirmJobCompleteService } from "../../api/ApiServices/jobrelated/confirmJobCompleteService";
import { removeJobService } from "../../api/ApiServices/jobrelated/removeJobService";
import PaymentModal from "../payments/PaymentModal";
import ComplaintModal from "./ComplaintModal";

// Statuses as returned by the API (uppercase enum values)
const STATUS = {
  OPEN: "OPEN",
  PENDING_PAYMENT: "PENDING_PAYMENT",
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
  customerName,

  // Customer review information
  customerHasReviewed,
  customerRating,
  customerReview,

  // Courier review information
  courierHasReviewed,
  courierRating,
  courierReview,

  onReviewed,
}) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);
  // const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        job_id: jobId,
        rating: String(selectedRating),
        review: comment.trim(),
      };

      let res;

      if (isCustomer) {
        // CUSTOMER -> COURIER
        res = await customerSaveReview(payload, token);
      } else {
        // COURIER -> CUSTOMER
        res = await saveCourierReview(payload, token);
      }

      if (res.status !== 1) {
        toast.error(res.msg || "Failed to submit review.");
        return;
      }

      toast.success(res.msg || "Review submitted successfully.");

      // Refresh job details
      if (!isCustomer) {
        setReviewJustSubmitted(true);
      } else {
        await onReviewed();
      }
      setSelectedRating(0);
      setComment("");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ============================
   * CUSTOMER VIEW
   * ============================
   */
  if (isCustomer) {
    // Customer already reviewed courier
    if (customerHasReviewed) {
      return (
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />

          <p className="font-semibold text-green-700">Review Submitted</p>

          <p className="text-sm text-green-600 mt-1">
            You have already reviewed the courier.
          </p>

          {customerRating && (
            <p className="mt-3 font-medium">
              ⭐ {Number(customerRating).toFixed(1)}/5
            </p>
          )}

          {customerReview && (
            <p className="text-slate-600 italic mt-2">"{customerReview}"</p>
          )}
        </div>
      );
    }

    // Customer review form
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

        {selectedRating > 0 && (
          <p className="text-xs text-slate-500">
            {
              ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                selectedRating
              ]
            }
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
          disabled={selectedRating === 0 || isSubmitting}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    );
  }

  /*
   * ============================
   * COURIER VIEW
   * ============================
   */

  return (
    <div className="space-y-4">
      {/* Customer's review shown to courier */}
      {customerHasReviewed ? (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />

            <p className="font-semibold text-blue-700">Customer Review</p>
          </div>

          {customerRating && (
            <p className="mt-3 font-medium">
              ⭐ {Number(customerRating).toFixed(1)}/5
            </p>
          )}

          {customerReview && (
            <p className="text-slate-600 italic mt-2">"{customerReview}"</p>
          )}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="font-semibold text-gray-700">
            Waiting for Customer Review
          </p>

          <p className="text-sm text-gray-500 mt-1">
            The customer has not submitted a review yet.
          </p>
        </div>
      )}

      {/* Courier has already reviewed customer */}
      {reviewJustSubmitted || courierHasReviewed ? (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />

          {/* <p className="font-semibold text-green-700 text-center">
           Your review has been submitted successfully and helps maintain a trusted delivery network.
          </p> */}

          <p className="font-semibold text-green-700 text-center">
            Review Submitted Successfully
          </p>

          <p className="text-sm text-green-600 text-center mt-1">
            Thank you for your feedback. It helps build a trusted delivery
            community.
          </p>

          {courierRating && (
            <p className="mt-3 font-medium text-center">
              ⭐ {Number(courierRating).toFixed(1)}/5
            </p>
          )}

          {courierReview && (
            <p className="text-slate-600 italic mt-2 text-center">
              "{courierReview}"
            </p>
          )}
        </div>
      ) : (
        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-500" />

            <p className="font-semibold text-slate-800">Review Customer</p>
          </div>

          {customerName && (
            <p className="text-sm text-slate-600">
              How was your experience with <strong>{customerName}</strong>?
            </p>
          )}

          <StarRating rating={selectedRating} setRating={setSelectedRating} />

          {selectedRating > 0 && (
            <p className="text-xs text-slate-500">
              {
                ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                  selectedRating
                ]
              }
            </p>
          )}

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment about the customer (optional)..."
            className="h-20 bg-white"
          />

          <Button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getJobDetails(id, type, token);

      if (res.status === 1) {
        setJob({
          ...res.payload.job,
          client_secret: res.payload.client_secret,
          publishable_key: res.payload.publishable_key,
        });
      } else {
        toast.error(res.msg);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [id, type, token]);

  const handleConfirmDelivery = async () => {
    if (!isCustomer) return;

    try {
      setIsUpdating(true);

      const res = await confirmJobCompleteService(job.id, token);

      if (res.status === 1) {
        toast.success(res.msg || "Delivery confirmed successfully.");

        // Refresh job details so is_delivery_confirmed becomes true
        await fetchJobDetails();
      } else {
        toast.error(res.msg || "Failed to confirm delivery.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to confirm delivery.");
    } finally {
      setIsUpdating(false);
    }
  };

  // this is remove job api call
  const handleRemoveJob = async () => {
    if (!job?.id) return;

    try {
      setIsUpdating(true);

      const res = await removeJobService(job.id, token);

      if (res.status === 1) {
        toast.success(res.msg || "Job removed successfully.");
        navigate(-1);
      } else {
        toast.error(res.msg || "Failed to remove job.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to remove job.");
    } finally {
      setIsUpdating(false);
    }
  };

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

  const customerHasReviewed =
    Boolean(job?.customer_reviewed_at) ||
    Boolean(job?.customer_given_rating) ||
    Boolean(job?.customer_given_review);

  const courierHasReviewed = Boolean(job?.courier_reviewed_at);

  // const courierHasReviewed =
  //   Boolean(job?.courier_reviewed_at) ||
  //   Boolean(job?.courier_given_rating) ||
  //   Boolean(job?.courier_given_review);

  const price = parseFloat(job.price) || 0;

  const PostupdateJobStatus = async (newStatus) => {
    try {
      setIsUpdating(true);

      const payload = {
        job_id: job.id,
        status: newStatus,
      };

      const res = await updateJobStatus(payload, token);

      if (res.status === 1) {
        toast.success(res.msg || "Job status updated successfully.");
        // Refresh the current page data
        await fetchJobDetails();
      } else {
        toast.error(res.msg || "Failed to update job status.");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed to update job status.");
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
                {job.status !== STATUS.PENDING_PAYMENT && (
                  <JobStatusStepper currentStatus={job.status} />
                )}
                {/* Here status is PENDING_PAYMENT then pay and remove button show */}

                {job.status === STATUS.PENDING_PAYMENT && (
                  <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-amber-600" />

                      <div>
                        <p className="font-semibold text-amber-800">
                          Payment Required
                        </p>

                        <p className="text-sm text-amber-700">
                          Please complete the payment to activate this job.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowPaymentModal(true)}
                        disabled={isUpdating}
                      >
                        Pay ${Number(job.price).toFixed(2)}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleRemoveJob}
                        disabled={isUpdating}
                      >
                        {isUpdating ? "Removing..." : "Remove Job"}
                      </Button>
                    </div>
                  </div>
                )}

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

                  {/* Pickup & Receiver Contact */}
                  {isCourier && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pickup Contact */}
                      {job.pickup_contact_phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-blue-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Pickup Contact
                            </p>

                            <p className="text-slate-900">
                              {job.pickup_contact_phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Receiver Contact */}
                      {job.receiver_contact_phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-green-500 mt-0.5" />

                          <div>
                            <p className="text-sm font-medium text-slate-600">
                              Receiver Contact
                            </p>

                            <p className="text-slate-900">
                              {job.receiver_contact_phone}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weight */}
                    <div className="flex items-start gap-3">
                      <Scale className="w-5 h-5 text-orange-500 mt-0.5" />

                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Weight (kg)
                        </p>

                        <p className="text-slate-900">
                          {job.weight || "Not provided"}
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
                          {job.dimensions || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Package Size
                        </p>
                        <p className="text-slate-900 font-medium">
                          {job.package_size || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Vehicle Required
                        </p>
                        <p className="text-slate-900 font-medium">
                          {job.vehicle_required || "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Urgent
                        </p>
                        <p className="text-slate-900 font-medium">
                          {job.urgent ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Pickup Date
                        </p>
                        <p className="text-slate-900">
                          {job.pickup_date
                            ? format(new Date(job.pickup_date), "MMM d, yyyy")
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Delivery Date
                        </p>
                        <p className="text-slate-900">
                          {job.delivery_date
                            ? format(new Date(job.delivery_date), "MMM d, yyyy")
                            : "Not provided"}
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
                    {job.special_instructions && (
                      <div className="md:col-span-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
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
                </div>

                {((isCourier &&
                  (job.status === STATUS.ASSIGNED ||
                    job.status === STATUS.PICKED_UP)) ||
                  (isCustomer && job.status === STATUS.ASSIGNED)) && (
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Actions</h3>

                    <div className="flex gap-4">
                      {/* Courier: Assigned → Picked Up */}
                      {isCourier && job.status === STATUS.ASSIGNED && (
                        <Button
                          onClick={() => PostupdateJobStatus(STATUS.PICKED_UP)}
                          disabled={isUpdating}
                        >
                          Mark as Picked Up
                        </Button>
                      )}

                      {/* Courier: Picked Up → Delivered */}
                      {isCourier && job.status === STATUS.PICKED_UP && (
                        <Button
                          onClick={() => PostupdateJobStatus(STATUS.DELIVERED)}
                          disabled={isUpdating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark as Delivered
                        </Button>
                      )}

                      {/* Customer: Can cancel ONLY before pickup */}
                      {isCustomer && job.status === STATUS.ASSIGNED && (
                        <Button
                          variant="destructive"
                          onClick={() => PostupdateJobStatus(STATUS.CANCELLED)}
                          disabled={isUpdating}
                        >
                          Cancel Job
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {job.status === STATUS.DELIVERED && (
                  <>
                    {isCustomer && !job.is_delivery_confirmed && (
                      <div className="p-5 bg-green-50 border border-green-200 rounded-xl mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="w-6 h-6 text-green-600" />

                          <div>
                            <h3 className="font-semibold text-green-800">
                              Delivery Confirmation Required
                            </h3>

                            <p className="text-sm text-green-700">
                              The courier has marked this job as delivered.
                              Please confirm that you received your package.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3">
                          <Button
                            onClick={handleConfirmDelivery}
                            disabled={isUpdating}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isUpdating ? "Confirming..." : "Confirm Delivery"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowComplaintModal(true)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Raise a Complaint
                          </Button>
                        </div>
                      </div>
                    )}

                    {isCustomer && job.is_delivery_confirmed && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6 text-center">
                        <p className="font-semibold text-green-700">
                          ✓ Delivery Confirmed
                        </p>

                        {job.confirmed_at && (
                          <p className="text-sm text-green-600 mt-1">
                            Confirmed on{" "}
                            {format(
                              new Date(job.confirmed_at),
                              "dd MMM yyyy, hh:mm a",
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    <DeliveredSection
                      jobId={job.id}
                      token={token}
                      isCustomer={isCustomer}
                      courierName={job.courier_name}
                      customerName={job.customer_name}
                      customerHasReviewed={customerHasReviewed}
                      customerRating={job.customer_given_rating}
                      customerReview={job.customer_given_review}
                      courierHasReviewed={courierHasReviewed}
                      courierRating={job?.courier_given_rating}
                      courierReview={job?.courier_given_review}
                      onReviewed={fetchJobDetails}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {job.status !== STATUS.PENDING_PAYMENT && (
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

                  {/* <p className="font-bold">
                  {isCustomer ? job.courier_name : job.customer_name}
                </p> */}

                  <p
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/user-profile/${
                          isCustomer ? job.courier_id : job.customer_id
                        }`,
                      )
                    }
                  >
                    {isCustomer ? job.courier_name : job.customer_name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {isCustomer ? job.courier_email : job.customer_email}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {isCustomer ? job.courier_phone : job.customer_phone}
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
            )}

            {/* This is ChatBox */}
            {job.status !== STATUS.PENDING_PAYMENT &&
              job.status !== STATUS.DELIVERED &&
              job.status !== STATUS.CANCELLED && (
                <ChatBox
                  jobId={job.id}
                  currentUserId={currentUser?.user_id}
                  receiverId={isCustomer ? job.courier_id : job.customer_id}
                  otherUserName={
                    isCustomer
                      ? job?.courier_name || "Courier"
                      : job?.customer_name || "Customer"
                  }
                />
              )}
          </div>
        </div>
      </div>
      {/* this is for Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        jobId={job.id}
        jobAmount={Number(job.price)}
        clientSecret={job.client_secret}
        publishableKey={job.publishable_key}
        onPaymentComplete={async () => {
          setShowPaymentModal(false);
          await fetchJobDetails();
        }}
      />

        {/* this is for complaint modal  */}
      <ComplaintModal
        open={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        jobId={job?.id}
        onSubmit={(complaintData) => {
          console.log("Complaint submitted:", complaintData);

          // Complaint API will go here later

          setShowComplaintModal(false);
        }}
      />
    </div>
  );
}
