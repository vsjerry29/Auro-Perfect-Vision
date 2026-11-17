"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  FileCode2,
  Layers,
  CreditCard,
  FileText,
  BookOpen,
  Bell,
  Settings,
  ArrowLeft,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
    { label: "Therapies & Catalog", href: "/admin/offerings", icon: Layers },
    { label: "Intake Form Builder", href: "/admin/intake-builder", icon: FileCode2 },
    { label: "Payments & Offline", href: "/admin/payments", icon: CreditCard },
    { label: "Invoice Records", href: "/admin/invoices", icon: FileText },
    { label: "Blogs & CMS", href: "/admin/cms", icon: BookOpen },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-ink-border p-5 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Brand & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-plum text-gold flex items-center justify-center">
              <Eye className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-sm font-medium text-ink block leading-none">
                Admin Console
              </span>
              <span className="text-[10px] text-gold-dark font-sans uppercase tracking-wider block mt-0.5">
                Auro Perfect Vision
              </span>
            </div>
          </div>
          <Badge variant="plum" className="text-[10px] w-full justify-center mt-2">
            Role: Super Admin (Front Desk)
          </Badge>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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

      {/* Return to Public Site */}
      <div className="pt-6 border-t border-ink-border/60 space-y-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-plum font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Website</span>
        </Link>
      </div>
    </aside>
  );
}
