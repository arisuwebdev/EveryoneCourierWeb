import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { getTermsOfServiceUrl } from "../api/ApiServices/getTermsOfServiceUrlApiService";

export default function TermsOfService() {
  const [termsOfService, setTermsOfService] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTermsOfService = async () => {
      try {
        setLoading(true);

        const response = await getTermsOfServiceUrl();

        if (response?.status === 1) {
          setTermsOfService(response?.payload?.termsOfService || "");
        } else {
          setError("Unable to load terms of service.");
        }
      } catch (err) {
        // console.error("Terms of service error:", err);
        setError("Unable to load terms of service.");
      } finally {
        setLoading(false);
      }
    };

    fetchTermsOfService();
  }, []);

  // Loader
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />

          <p className="mt-4 text-gray-600">
            Loading terms of service...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-24">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {!error && termsOfService && (
          <div
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html: termsOfService,
            }}
          />
        )}

        {!error && !termsOfService && (
          <div className="text-slate-500 text-sm">
            Terms of service are not available.
          </div>
        )}

      </div>
    </div>
  );
}

