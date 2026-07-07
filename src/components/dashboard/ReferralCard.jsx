import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, CheckCheck, Users } from "lucide-react";

export default function ReferralCard() {
  const [copied, setCopied] = useState(false);

  const appUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Everyone's a Courier",
        text: "Turn your everyday journeys into earning opportunities! Join me on Everyone's a Courier — the peer-to-peer delivery app.",
        url: appUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="mb-8 border-0 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Invite Your Friends!</h3>
              <p className="text-blue-100 text-sm max-w-md">
                Know someone who needs a delivery, or a friend looking to earn on the side? 
                Share Everyone's a Courier and help them get started!
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleCopy}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              {copied ? <CheckCheck className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              onClick={handleShare}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share App
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-4 bg-blue-50 flex flex-wrap gap-6 text-sm text-slate-600">
        <span>🚀 <strong>Fast sign up</strong> — takes less than 2 minutes</span>
        <span>📦 <strong>Post or deliver</strong> — choose your role</span>
        <span>💸 <strong>Earn money</strong> on your existing journeys</span>
      </CardContent>
    </Card>
  );
}