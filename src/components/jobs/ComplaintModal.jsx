import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function ComplaintModal({
  open,
  onClose,
  jobId,
  onSubmit,
}) {
  const [selectedComplaint, setSelectedComplaint] = useState("");
  const [description, setDescription] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setSelectedComplaint("");
    setDescription("");
    onClose();
  };

  const handleSubmit = () => {
    if (!selectedComplaint || !description.trim()) {
      return;
    }

    const selectedComplaintData = complaints.find(
      (complaint) => complaint.value === selectedComplaint
    );

    onSubmit({
      job_id: jobId,
      complaint_type: selectedComplaint,
      subject: selectedComplaintData?.title || "",
      description: description.trim(),
    });

    setSelectedComplaint("");
    setDescription("");
  };

  const complaints = [
    {
      value: "UNDELIVERED_ITEMS",
      title: "Undelivered Item",
      description: "The package was not delivered.",
    },
    {
      value: "DAMAGED_ITEMS",
      title: "Damaged Item",
      description: "The package or item was damaged during delivery.",
    },
    {
      value: "PAYMENT_DISPUTE",
      title: "Payment Dispute",
      description: "There is an issue with the payment or payment amount.",
    },
    {
      value: "MISREPRESENTATION",
      title: "Misrepresentation",
      description:
        "The job, package, service, or other information was misrepresented.",
    },
  ];

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Dispute Resolution
          </h2>

          <p className="text-[11px] text-slate-500 mt-0.5">
            Please select the reason for your complaint.
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <div className="space-y-1.5">
          {complaints.map((complaint) => (
            <button
              key={complaint.value}
              type="button"
              onClick={() => setSelectedComplaint(complaint.value)}
              className={`w-full rounded-md border px-3 py-2 text-left transition ${
                selectedComplaint === complaint.value
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-red-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`w-4 h-4 shrink-0 ${
                    selectedComplaint === complaint.value
                      ? "text-red-600"
                      : "text-slate-400"
                  }`}
                />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">
                    {complaint.title}
                  </p>

                  <p className="text-[10px] leading-3 text-slate-500 mt-0.5">
                    {complaint.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Description */}
        {selectedComplaint && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Describe the problem
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details..."
              rows={2}
              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-xs outline-none resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 border-t px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!selectedComplaint || !description.trim()}
          onClick={handleSubmit}
          className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700"
        >
          Submit Complaint
        </Button>
      </div>
    </div>
  </div>
);
}