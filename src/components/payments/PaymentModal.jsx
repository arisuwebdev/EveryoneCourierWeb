import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import PaymentBreakdown from "./PaymentBreakdown";
// import { createPaymentIntent } from "../../../base44/functions/createPaymentIntent";
// import { getStripePublishableKey } from "../../../base44/functions/getStripePublishableKey";


let stripePromise = null;
const getStripe = async () => {
  if (!stripePromise) {
    const res = await getStripePublishableKey({});
    stripePromise = loadStripe(res.data.publishableKey);
  }
  return stripePromise;
};

function CheckoutForm({ jobAmount, onPaymentComplete, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      setErrorMsg(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentComplete({
        job_amount: jobAmount,
        platform_fee: jobAmount * 0.10,
        courier_payout: jobAmount * 0.90,
        total_charged: jobAmount,
        payment_method: 'credit_card',
        payment_status: 'completed',
        transaction_id: paymentIntent.id,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentBreakdown jobAmount={jobAmount} />
      <PaymentElement />
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <div className="space-y-3 pt-2">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Processing...</>
          ) : (
            `Pay $${jobAmount.toFixed(2)}`
          )}
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-center text-slate-500">
        <Lock className="w-3 h-3 inline mr-1" />Secured by Stripe
      </p>
    </form>
  );
}

export default function PaymentModal({ isOpen, onClose, jobAmount, jobId, courierStripeAccountId, onPaymentComplete }) {
  const [clientSecret, setClientSecret] = useState('');
  const [stripe, setStripe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSplitPayment, setIsSplitPayment] = useState(false);

  useEffect(() => {
    if (!isOpen || !jobAmount) return;
    setLoading(true);
    setError('');
    const amountCents = Math.round(jobAmount * 100);
    Promise.all([
      createPaymentIntent({
        job_id: jobId,
        amount_cents: amountCents,
        courier_stripe_account_id: courierStripeAccountId || null,
      }),
      getStripe(),
    ]).then(([res, stripeInstance]) => {
      setClientSecret(res.data.clientSecret);
      setIsSplitPayment(res.data.split_payment || false);
      setStripe(stripeInstance);
      setLoading(false);
    }).catch(() => {
      setError('Could not initialize payment. Please try again.');
      setLoading(false);
    });
  }, [isOpen, jobAmount, jobId, courierStripeAccountId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-4">{error}</p>}

        {clientSecret && !loading && stripe && (
          <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
            <CheckoutForm jobAmount={jobAmount} onPaymentComplete={onPaymentComplete} onClose={onClose} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}