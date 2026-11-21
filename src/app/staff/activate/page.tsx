"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

function StaffActivationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ email: string; fullName: string; role: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenError("Missing invitation token. Please check your invitation email link.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/invite/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setTokenError(data.error || "This invitation link is invalid or has expired.");
        } else {
          setUserInfo(data.user);
        }
      } catch (err: any) {
        setTokenError("Unable to verify invitation token. Please check your connection.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  // Password Complexity Validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isFormValid) {
      setSubmitError("Please meet all password security requirements before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || "Failed to activate your account. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/staff/login?activated=1");
      }, 2000);
    } catch {
      setSubmitError("Network or server error during account activation.");
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-ink-border shadow-card max-w-md w-full text-center space-y-4">
          <div className="w-10 h-10 border-2 border-plum border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-ink text-base">Verifying invitation token...</p>
        </div>
      </div>
    );
  }

  if (tokenError || !userInfo) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-card text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal">Invitation Unavailable</h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              {tokenError || "This invitation link has expired or is invalid. Invitations expire automatically after 48 hours for security."}
            </p>
            <div className="pt-2">
              <Link
                href="/staff/login"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-plum text-gold text-xs font-semibold hover:bg-plum-light transition-colors"
              >
                Return to Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-card text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl text-ink font-normal">Account Activated!</h2>
            <p className="text-xs text-ink-muted leading-relaxed">
              Your password has been securely established with OWASP PBKDF2 hashing. Redirecting you to the staff sign-in portal...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-12 h-12 rounded-full bg-plum text-gold flex items-center justify-center shadow group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-normal text-ink tracking-tight">
          Activate Staff Account
        </h2>
        <p className="text-xs text-gold-dark font-sans uppercase tracking-widest mt-1">
          Auro Perfect Vision • Auroville
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-ink-border sm:px-10 space-y-6">
          <div className="bg-canvas-light p-3.5 rounded-2xl border border-ink-border/60">
            <span className="text-[10px] text-ink-muted uppercase tracking-wider block font-semibold">
              Activating Account
            </span>
            <div className="font-semibold text-xs text-ink mt-0.5">{userInfo.fullName}</div>
            <div className="text-xs text-ink-muted">{userInfo.email}</div>
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Create New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-ink-muted hover:text-ink transition-colors p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
            </div>

            {/* Password Security Rules */}
            <div className="bg-canvas-light p-3.5 rounded-xl border border-ink-border/40 space-y-1.5 text-[11px]">
              <span className="font-semibold text-ink block text-[10px] uppercase tracking-wider">
                Password Security Requirements:
              </span>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700" : "text-ink-muted"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700" : "text-ink-muted"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700" : "text-ink-muted"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least one lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700" : "text-ink-muted"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least one numerical digit (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-emerald-700" : "text-ink-muted"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least one special symbol (!@#$%^&amp;*)</span>
              </div>
              {password.length > 0 && (
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-700" : "text-red-600 font-medium"}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={submitting || !isFormValid}
              className="w-full text-xs font-semibold tracking-wide py-3 gap-2 mt-2"
            >
              <span>{submitting ? "Activating Account..." : "Activate Account & Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/staff/login"
            className="text-xs text-ink-muted hover:text-plum font-medium transition-colors"
          >
            ← Return to Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StaffActivationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
          <p className="font-serif text-ink text-base">Loading activation page...</p>
        </div>
      }
    >
      <StaffActivationForm />
    </Suspense>
  );
}
