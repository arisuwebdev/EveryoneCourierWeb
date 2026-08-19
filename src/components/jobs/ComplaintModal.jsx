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

    onSubmit({
      job_id: jobId,
      complaint_type: selectedComplaint,
      description: description.trim(),
    });

    setSelectedComplaint("");
    setDescription("");
  };

  const complaints = [
    {
      value: "UNDELIVERED",
      title: "Undelivered Item",
      description: "The package was not delivered.",
    },
    {
      value: "DAMAGED",
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
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Dispute Resolution
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Please select the reason for your complaint.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <button
                key={complaint.value}
                type="button"
                onClick={() =>
                  setSelectedComplaint(complaint.value)
                }
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedComplaint === complaint.value
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 hover:border-red-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 mt-0.5 ${
                      selectedComplaint === complaint.value
                        ? "text-red-600"
                        : "text-slate-400"
                    }`}
                  />

                  <div>
                    <p className="font-semibold text-slate-900">
                      {complaint.title}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {complaint.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Description */}
          {selectedComplaint && (
            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe the problem
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about your complaint..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none resize-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              !selectedComplaint ||
              !description.trim()
            }
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            Submit Complaint
          </Button>
        </div>
      </div>
    </div>
  );
}