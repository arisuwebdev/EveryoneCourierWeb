import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReviewModal({ isOpen, onClose, job, courier, currentUser, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Recalculate courier's average rating
    const allReviews = await base44.entities.Review.filter({ courier_id: job.courier_id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await base44.entities.User.update(job.courier_id, { rating: parseFloat(avg.toFixed(2)) });

    setIsSubmitting(false);
    onReviewSubmitted();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your Courier</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {courier && (
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={courier.avatar_url} />
                <AvatarFallback>{courier.full_name?.charAt(0) || "C"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900">{courier.full_name}</p>
                <p className="text-sm text-slate-500">{job.title}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">How would you rate this delivery?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= (hovered || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-slate-500 mt-1">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Leave a comment (optional)</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience with this courier..."
              className="h-24"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Skip
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
              disabled={rating === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}