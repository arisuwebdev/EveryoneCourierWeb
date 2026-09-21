import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { changePassword } from "../../api/ApiServices/auth/changePasswordService";
import { useAuth } from "../../lib/AuthContext";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { token } = useAuth();
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (oldPassword === newPassword) {
      setError("New password must be different from old password.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        old_password: oldPassword,
        new_password: newPassword,
          new_password_confirmation: confirmPassword,
      };

      const response = await changePassword(payload, token);


      if (response?.status === 1) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Close modal first
        onClose();

        // Show toast after modal closes
        setTimeout(() => {
          toast.success(response?.msg || "Password changed successfully.");
        }, 200);
      } else {
        setError(
          response?.msg || response?.message || "Unable to change password.",
        );
      }
    } catch (err) {
     

      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[calc(100vh-32px)] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>

            <h2 className="text-lg font-semibold text-slate-800">
              Change Password
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Old Password
            </label>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter old password"
              disabled={loading}
              autoComplete="current-password"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter new password"
              disabled={loading}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Confirm new password"
              disabled={loading}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}

              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
