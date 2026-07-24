import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/ApiServices/registerService";
import { sendOtpService } from "../api/ApiServices/sentOtpService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";
// import { toast } from "../components/ui/use-toast";
import { Checkbox } from "../components/ui/checkbox";
import { getTermsOfServiceUrl } from "../api/ApiServices/getTermsOfServiceUrlApiService";
import { getPrivacyPolicyUrl } from "../api/ApiServices/getPrivacyPolicyUrlApiService";
import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [termsUrl, setTermsUrl] = useState("");
  const [privacyUrl, setPrivacyUrl] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!accepted) {
      const message = "Please accept the Terms of Service and Privacy Policy.";
      setError(message);
      toast.error(message);
      return;
    }
    console.log("accepted:", accepted);

    try {
      setLoading(true);
      const response = await sendOtpService(email);

      if (response.status === 1) {
        setShowOtp(true);
        toast.success(response.msg);
      } else {
        setError(response.msg);
        toast.error(response.msg);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg ||
        err.response?.data?.payload?.verrors ||
        err.response?.data?.message ||
        err.message ||
        "Failed to send OTP";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const [termsRes, privacyRes] = await Promise.all([
          getTermsOfServiceUrl(),
          getPrivacyPolicyUrl(),
        ]);

        setTermsUrl(
          termsRes?.payload?.termsOfServiceUrl ||
            termsRes?.data?.payload?.termsOfServiceUrl ||
            "#",
        );

        setPrivacyUrl(
          privacyRes?.payload?.privacyPolicyUrl ||
            privacyRes?.data?.payload?.privacyPolicyUrl ||
            "#",
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchUrls();
  }, []);

  const handleVerify = async () => {
    setError("");

    try {
      setLoading(true);

      const response = await registerUser({
        email,
        password,
        otp: otpCode,
        is_terms_accepted: true,
      });

      toast.success(response.msg || "Account created successfully.");

      login(response);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    setError("");

    try {
      setLoading(true);

      await sendOtpService(email);

      toast.success("Check your email for the new code.");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to resend OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    alert("Google Sign-In is disabled.");
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            className="text-primary font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(!!checked)}
            className="mt-1"
          />

          <label
            htmlFor="terms"
            className="text-sm text-muted-foreground leading-6 cursor-pointer"
          >
            I have read and agree to the{" "}
            <a
              href={termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href={privacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Privacy Policy
            </a>
            . I confirm I am 17 years of age or older.
          </label>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
