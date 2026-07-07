import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, CheckCircle, ExternalLink, AlertTriangle, RefreshCw, Clock, Shield } from "lucide-react";
//  import { stripeConnectOnboard } from "../../../base44/functions/stripeConnectOnboard";
// import { stripeAccountStatus } from "@/functions/stripeAccountStatus";

export default function StripeConnectOnboarding({ user }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountStatus, setAccountStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (user?.stripe_account_id) {
      fetchAccountStatus();
    }
  }, [user?.stripe_account_id]);

  const fetchAccountStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await stripeAccountStatus({});
      if (res.data) setAccountStatus(res.data);
    } catch (e) {
      // silently fail
    }
    setStatusLoading(false);
  };

  const handleOnboard = async () => {
    setIsLoading(true);
    setError('');
    const returnUrl = window.location.href;
    const res = await stripeConnectOnboard({ return_url: returnUrl });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setError(res.data?.error || 'Could not start onboarding. Please try again.');
      setIsLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setIsDashboardLoading(true);
    setError('');
    const res = await stripeConnectOnboard({ return_url: window.location.href, mode: 'dashboard' });
    if (res.data?.url) {
      window.open(res.data.url, '_blank');
    } else {
      setError(res.data?.error || 'Could not open dashboard.');
    }
    setIsDashboardLoading(false);
  };

  const isConnected = !!user?.stripe_account_id;
  const isFullyActive = accountStatus?.payouts_enabled && accountStatus?.charges_enabled;
  const isPending = isConnected && !isFullyActive;
  const hasRequirements = accountStatus?.requirements?.currently_due?.length > 0;

  const getStatusBadge = () => {
    if (!isConnected) return <Badge variant="secondary">Not Connected</Badge>;
    if (statusLoading) return <Badge variant="secondary">Checking...</Badge>;
    if (isFullyActive) return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    if (hasRequirements) return <Badge className="bg-yellow-100 text-yellow-800">Action Required</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payouts Setup
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">

        {!isConnected && (
          <>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Connect your Stripe account to receive payments for your deliveries. You'll get <strong>90%</strong> of each job directly to your bank account.
              </p>
              <div className="grid grid-cols-3 gap-3 py-3">
                {[
                  { icon: Shield, label: "Identity Verified", desc: "Secure KYC" },
                  { icon: CreditCard, label: "Bank Connected", desc: "Direct deposit" },
                  { icon: CheckCircle, label: "Auto Payouts", desc: "After each job" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
                    <Icon className="w-5 h-5 mx-auto mb-1 text-indigo-500" />
                    <p className="text-xs font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {error && <Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-700">{error}</AlertDescription></Alert>}
            <Button onClick={handleOnboard} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600">
              {isLoading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Setting up...</>
              ) : (
                <><ExternalLink className="w-4 h-4 mr-2" />Connect Stripe Account</>
              )}
            </Button>
            <p className="text-xs text-slate-400 text-center">Powered by Stripe Connect — secure bank-level payouts</p>
          </>
        )}

        {isConnected && (
          <>
            {statusLoading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                Checking account status...
              </div>
            ) : (
              <div className="space-y-3">
                {/* Status rows */}
                <div className="space-y-2">
                  {[
                    { label: "Details Submitted", value: accountStatus?.details_submitted },
                    { label: "Payouts Enabled", value: accountStatus?.payouts_enabled },
                    { label: "Charges Enabled", value: accountStatus?.charges_enabled },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600">{label}</span>
                      {value
                        ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-4 h-4" /> Yes</span>
                        : <span className="flex items-center gap-1 text-slate-400"><Clock className="w-4 h-4" /> Pending</span>
                      }
                    </div>
                  ))}
                </div>

                {/* Identity verification */}
                {accountStatus?.individual?.verification_status && (
                  <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                    <span className="text-slate-600">Identity Verification</span>
                    <Badge className={
                      accountStatus.individual.verification_status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {accountStatus.individual.verification_status}
                    </Badge>
                  </div>
                )}

                {/* Requirements */}
                {hasRequirements && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <p className="font-medium mb-1">Action required to activate payouts:</p>
                      <ul className="text-xs space-y-1">
                        {accountStatus.requirements.currently_due.map(req => (
                          <li key={req} className="capitalize">• {req.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {isFullyActive && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-900">
                      Your payout account is fully active. You'll automatically receive 90% of each completed job.
                    </AlertDescription>
                  </Alert>
                )}

                {accountStatus?.requirements?.disabled_reason && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Account disabled: {accountStatus.requirements.disabled_reason.replace(/_/g, ' ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {error && <Alert className="border-red-200 bg-red-50"><AlertDescription className="text-red-700">{error}</AlertDescription></Alert>}

            <div className="flex gap-2 pt-2">
              {(hasRequirements || !isFullyActive) && (
                <Button onClick={handleOnboard} disabled={isLoading} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600">
                  {isLoading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Loading...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" />Complete Setup</>
                  )}
                </Button>
              )}
              {isFullyActive && (
                <Button variant="outline" onClick={handleOpenDashboard} disabled={isDashboardLoading} className="flex-1">
                  {isDashboardLoading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400 mr-2"></div>Opening...</>
                  ) : (
                    <><ExternalLink className="w-4 h-4 mr-2" />Stripe Dashboard</>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={fetchAccountStatus} disabled={statusLoading} title="Refresh status">
                <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}