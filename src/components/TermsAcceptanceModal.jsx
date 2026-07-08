import React, { useState, useEffect } from "react";
// import { base44 } from "@/api/base44Client";
// import { base44 } from "../../src/api/base44Client";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Link } from "react-router-dom";
import { ScrollText } from "lucide-react";

export default function TermsAcceptanceModal() {
  const [show, setShow] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const check = async () => {
      try {
        const me = await base44.auth.me();
        if (me && !me.terms_accepted) {
          setUser(me);
          setShow(true);
        }
      } catch {
        // Not logged in, no need to show
      }
    };
    check();
  }, []);

  const handleAccept = async () => {
    if (!accepted) return;
    setIsSubmitting(true);
    await base44.auth.updateMe({ terms_accepted: true, terms_accepted_date: new Date().toISOString() });
    setShow(false);
    setIsSubmitting(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Welcome to Everyone's a Courier</h2>
            <p className="text-sm text-slate-500">Please review and accept our terms to continue</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2 border border-slate-200">
          <p>Before you start using the platform, you need to agree to our:</p>
          <ul className="space-y-1 mt-2">
            <li>
              <Link to="/TermsOfService" target="_blank" className="text-blue-600 underline font-medium">
                Terms of Service
              </Link>
              {" "}— your rights and responsibilities as a user
            </li>
            <li>
              <Link to="/PrivacyPolicy" target="_blank" className="text-blue-600 underline font-medium">
                Privacy Policy
              </Link>
              {" "}— how we handle your personal information
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={accepted}
            onCheckedChange={setAccepted}
            className="mt-0.5"
          />
          <span className="text-sm text-slate-700">
            I have read and agree to the{" "}
            <Link to="/TermsOfService" target="_blank" className="text-blue-600 underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/PrivacyPolicy" target="_blank" className="text-blue-600 underline">Privacy Policy</Link>.
            I confirm I am 17 years of age or older.
          </span>
        </label>

        <Button
          onClick={handleAccept}
          disabled={!accepted || isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {isSubmitting ? "Saving..." : "Accept & Continue"}
        </Button>

        <p className="text-xs text-slate-400 text-center">
          You cannot use the platform without accepting these terms.
        </p>
      </div>
    </div>
  );
}