import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function CourierReviews({ courierId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewers, setReviewers] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.Review.filter({ courier_id: courierId }, "-created_date", 20);
      setReviews(data);

      if (data.length > 0) {
        const allUsers = await base44.entities.User.list();
        const map = {};
        allUsers.forEach((u) => { map[u.id] = u; });
        setReviewers(map);
      }

      setIsLoading(false);
    };
    if (courierId) load();
  }, [courierId]);

  if (isLoading) return null;

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Reviews & Ratings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No reviews yet. Complete deliveries to earn ratings!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-600">{avg}</p>
                <StarDisplay rating={Math.round(parseFloat(avg))} />
                <p className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-4 text-slate-600">{star}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-4 text-slate-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual reviews */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {reviews.map((review) => {
                const reviewer = reviewers[review.customer_id];
                return (
                  <div key={review.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {reviewer?.full_name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{reviewer?.full_name || "Customer"}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {format(new Date(review.created_date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <StarDisplay rating={review.rating} />
                        {review.comment && (
                          <p className="text-sm text-slate-600 mt-1">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}