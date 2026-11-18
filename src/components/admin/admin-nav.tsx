"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Contact,
  MessageSquare,
  CheckSquare,
  Layers,
  Compass,
  Users,
  FileCode2,
  BookOpen,
  Image,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Settings,
  Eye,
  LogOut,
  Activity,
  FileText,
} from "lucide-react";

interface NavGroup {
  group: string;
  items: {
    label: string;
    href: string;
    icon: any;
  }[];
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string; role: string } | null>(null);

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

  const navGroups: NavGroup[] = [
    {
      group: "Core Operations",
      items: [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
        { label: "Master Calendar", href: "/admin/calendar", icon: Calendar },
      ],
    },
    {
      group: "Clinical EMR",
      items: [
        { label: "Patient Records & EMR", href: "/admin/emr", icon: FileText },
      ],
    },
    {
      group: "Clients & CRM",
      items: [
        { label: "Clients Directory", href: "/admin/crm", icon: Contact },
        { label: "Inquiries & Leads", href: "/admin/crm/inquiries", icon: MessageSquare },
        { label: "Follow-up Tasks", href: "/admin/crm/tasks", icon: CheckSquare },
      ],
    },
    {
      group: "Services & Retreats",
      items: [
        { label: "Therapies Catalogue", href: "/admin/offerings", icon: Layers },
        { label: "Flagship Programmes", href: "/admin/programmes", icon: Compass },
        { label: "Practitioners Roster", href: "/admin/therapists", icon: Users },
        { label: "Intake Form Builder", href: "/admin/intake-builder", icon: FileCode2 },
      ],
    },
    {
      group: "Website CMS",
      items: [
        { label: "Website Editor", href: "/admin/cms", icon: BookOpen },
        { label: "Media Library", href: "/admin/media", icon: Image },
      ],
    },
    {
      group: "Finance & Admin",
      items: [
        { label: "Payments & Invoices", href: "/admin/payments", icon: CreditCard },
        { label: "Manage Staff Users", href: "/admin/users", icon: UserCheck },
        { label: "Compliance & Audit", href: "/admin/audit", icon: ShieldAlert },
        { label: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-ink-border p-5 flex flex-col justify-between shrink-0 max-h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Brand & Badge */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-plum text-gold flex items-center justify-center shrink-0">
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
          <div className="bg-plum-muted/60 p-2.5 rounded-lg border border-plum/10 mt-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-plum block truncate">
                {user?.fullName || "Administrator"}
              </span>
              <span className="text-[9px] font-mono uppercase bg-plum/10 text-plum px-1.5 py-0.5 rounded font-bold">
                {user?.role || "admin"}
              </span>
            </div>
            <span className="text-ink-muted text-[10px] block truncate mt-0.5">
              {user?.email || "admin@auroperfectvision.com"}
            </span>
          </div>
        </div>

        {/* Links Navigation Groups */}
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-muted/70 px-2.5 block">
                {group.group}
              </span>
              {group.items.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : link.href === "/admin/crm"
                    ? pathname === "/admin/crm" || pathname.startsWith("/admin/crm/clients")
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-plum text-white font-semibold shadow-sm"
                        : "text-ink hover:bg-canvas-dark"
                    }`}
                  >
                    <Icon className="w-4 h-4 opacity-80 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Role Notice & Return Link */}
      <div className="pt-6 mt-6 border-t border-ink-border/60 space-y-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <span>Sign Out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>

        <div className="text-center">
          <Link
            href="/"
            className="text-[11px] text-ink-muted hover:text-plum font-medium transition-colors block"
          >
            ← Public Website
          </Link>
        </div>
      </div>
    </aside>
  );
}
