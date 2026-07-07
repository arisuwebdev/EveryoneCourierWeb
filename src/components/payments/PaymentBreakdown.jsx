import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PaymentBreakdown({ jobAmount, showDetails = true }) {
  const platformFee = jobAmount * 0.10; // 10% commission
  const courierPayout = jobAmount - platformFee;
  const totalCharged = jobAmount; // For now, customer pays job amount, platform takes fee from courier

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <DollarSign className="w-5 h-5" />
          Payment Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Everyone's a Courier charges a 10% platform fee to maintain our secure delivery network.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Job Payment</span>
            <span className="font-semibold">${jobAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Platform Fee (10%)</span>
            <span className="text-red-600">-${platformFee.toFixed(2)}</span>
          </div>
          
          <hr className="border-slate-200" />
          
          <div className="flex justify-between items-center">
            <span className="text-slate-600">You'll pay</span>
            <span className="font-bold text-lg text-green-700">${totalCharged.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Courier receives</span>
            <span className="font-semibold text-green-600">${courierPayout.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/60 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CreditCard className="w-4 h-4" />
            <span>Secure payments powered by Everyone's a Courier</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}