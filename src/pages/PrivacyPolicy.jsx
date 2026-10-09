import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPrivacyPolicyUrl } from "../api/ApiServices/getPrivacyPolicyUrlApiService";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        setLoading(true);

        const response = await getPrivacyPolicyUrl();

        if (response?.status === 1) {
          setPrivacyPolicy(response?.payload?.privacyPolicy || "");
        } else {
          setError("Unable to load privacy policy.");
        }
      } catch (err) {
        setError("Unable to load privacy policy.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  // Loader
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

          <p className="mt-4 text-gray-600">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {!error && privacyPolicy && (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: privacyPolicy,
            }}
          />
        )}

        {!error && !privacyPolicy && (
          <div className="text-slate-500 text-sm">
            Privacy policy is not available.
          </div>
        )}
      </div>
    </div>
  );
}
