"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Clock, UserCheck, ArrowLeft, Eye, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TherapistNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/staff/login");
      router.refresh();
    } catch {
      window.location.href = "/staff/login";
    }
  };

  const links = [
    { label: "My Appointments", href: "/therapist", icon: Calendar },
    { label: "Weekly Schedule", href: "/therapist/schedule", icon: Clock },
    { label: "Time Off & Leave", href: "/therapist/time-off", icon: UserCheck },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-ink-border p-6 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Portal Identifier */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-plum text-gold flex items-center justify-center">
              <Eye className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-sm font-medium text-ink block leading-none">
                Therapist Workspace
              </span>
              <span className="text-[10px] text-gold-dark font-sans uppercase tracking-wider block mt-0.5">
                Auro Perfect Vision
              </span>
            </div>
          </div>
          <div className="bg-sage/40 p-2.5 rounded-lg border border-sage-muted mt-3 text-[11px]">
            <span className="font-semibold text-sage-dark block truncate">
              {user?.fullName || "Dr. Ananya Sen"}
            </span>
            <span className="text-ink-muted text-[10px] block truncate">
              {user?.email || "therapist@auroperfectvision.com"}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-plum text-white font-semibold"
                    : "text-ink hover:bg-canvas-dark"
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Notice & Return Link */}
      <div className="pt-6 border-t border-ink-border/60 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <span>Sign Out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium px-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
