import React, { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

import PaymentBreakdown from "./PaymentBreakdown";
import { confirmJobPayment } from "../../api/ApiServices/jobrelated/confirmJobPaymentService";
import { useAuth } from "../../lib/AuthContext";
import { toast } from "react-toastify";

function CheckoutForm({ jobId, jobAmount, onPaymentComplete, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMsg("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrorMsg(error.message || "Payment failed.");
      toast.error(error.message || "Payment failed.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const payload = {
          job_id: jobId,
          payment_intent_id: paymentIntent.id,
          payment_method: "credit_card",
        };

        const res = await confirmJobPayment(payload, token);

        if (res.status === 1) {
          toast.success(res.msg);

          onPaymentComplete?.(res);
          onClose();
        } else {
          setErrorMsg(res.msg || "Payment confirmation failed.");
          toast.error(res.msg || "Payment confirmation failed.");
        }
      } catch (err) {
        const message =
          err?.response?.data?.msg || "Payment confirmation failed.";
        setErrorMsg(message);
        toast.error(message);
      } finally {
        setIsProcessing(false);
      }
    } else {
      const message = "Payment was not successful.";
      setErrorMsg(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentBreakdown jobAmount={jobAmount} />

      <PaymentElement />

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Processing...
            </>
          ) : (
            `Pay $${Number(jobAmount).toFixed(2)}`
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isProcessing}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>

      <p className="text-center text-xs text-slate-500">
        <Lock className="mr-1 inline h-3 w-3" />
        Secured by Stripe
      </p>
    </form>
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  jobId,
  jobAmount,
  clientSecret,
  publishableKey,
  onPaymentComplete,
}) {
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {!clientSecret || !publishableKey ? (
          <div className="py-8 text-center text-red-500">
            Unable to initialize payment.
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
              },
            }}
          >
            <CheckoutForm
              jobId={jobId}
              jobAmount={jobAmount}
              onPaymentComplete={onPaymentComplete}
              onClose={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
