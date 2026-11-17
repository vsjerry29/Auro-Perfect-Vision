"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, UserCheck, ArrowLeft, Eye, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TherapistNav() {
  const pathname = usePathname();

  const links = [
    { label: "My Appointments", href: "/therapist", icon: Calendar },
    { label: "Weekly Schedule", href: "/therapist/schedule", icon: Clock },
    { label: "Time Off & Leave", href: "/therapist/time-off", icon: UserCheck },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-ink-border p-6 flex flex-col justify-between">
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
          <Badge variant="sage" className="text-[10px] w-full justify-center mt-2">
            Active: Dr. Ananya Sen
          </Badge>
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
        <div className="bg-canvas p-2.5 rounded-lg border border-ink-border text-[11px] text-ink-muted">
          <p className="font-medium text-ink">Demo Role Guard:</p>
          <p className="text-[10px] text-ink-muted mt-0.5">
            Therapists view assigned appointments only. Pricing and global settings stay with Admin.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Public Website</span>
        </Link>
      </div>
    </aside>
  );
}
