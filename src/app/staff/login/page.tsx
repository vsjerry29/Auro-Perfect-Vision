"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function StaffLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Successful login
      if (redirectTarget && redirectTarget.startsWith("/")) {
        router.push(redirectTarget);
      } else {
        router.push(data.redirectUrl || (data.role === "admin" ? "/admin" : "/therapist"));
      }
      router.refresh();
    } catch (err: any) {
      setError("Network or server error during sign in.");
      setLoading(false);
    }
  };

  const handleFillDemo = (type: "admin" | "therapist") => {
    if (type === "admin") {
      setEmail("admin@auroperfectvision.com");
      setPassword("AuroVision@2026!");
    } else {
      setEmail("therapist@auroperfectvision.com");
      setPassword("AnanyaVision@2026!");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-12 h-12 rounded-full bg-plum text-gold flex items-center justify-center shadow group-hover:scale-105 transition-transform">
            <Eye className="w-6 h-6 stroke-[2.2]" />
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-normal text-ink tracking-tight">
          Staff Portal Access
        </h2>
        <p className="text-xs text-gold-dark font-sans uppercase tracking-widest mt-1">
          Auro Perfect Vision • Auroville
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-3xl border border-ink-border sm:px-10 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@auroperfectvision.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={loading}
              className="w-full text-xs font-semibold tracking-wide py-3 gap-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Initial Setup / Evaluation Quick-Fill */}
          <div className="pt-6 border-t border-ink-border/60">
            <span className="text-[11px] font-semibold text-ink-muted block uppercase tracking-wider mb-2 text-center">
              Initial Staff Bootstrap Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="py-2 px-2.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-[11px] hover:bg-canvas-dark transition-colors font-medium"
              >
                Auto-fill Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo("therapist")}
                className="py-2 px-2.5 rounded-lg border border-ink-border bg-canvas-light text-ink text-[11px] hover:bg-canvas-dark transition-colors font-medium"
              >
                Auto-fill Therapist
              </button>
            </div>
            <p className="text-[10px] text-ink-muted text-center mt-2.5">
              Admin manages offerings, team & CMS. Therapist manages own calendar & assigned appointments.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-ink-muted hover:text-plum font-medium transition-colors"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
          <p className="font-serif text-ink text-base">Loading Staff Portal...</p>
        </div>
      }
    >
      <StaffLoginForm />
    </React.Suspense>
  );
}
