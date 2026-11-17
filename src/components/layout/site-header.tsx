"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Menu, X, ArrowUpRight, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If in admin or therapist dashboard, show dedicated dashboard bar or minimal switcher
  const isDashboard = pathname.startsWith("/admin") || pathname.startsWith("/therapist");

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Therapies & Programmes", href: "/therapies" },
    { label: "Team", href: "/team" },
    { label: "Journal", href: "/blogs" },
  ];

  return (
    <>
      {/* Top Advisory Strip */}
      <div className="bg-plum text-canvas-light text-xs py-1.5 px-4 text-center font-sans tracking-wide flex items-center justify-center gap-3">
        <span>Auro Perfect Vision — Centre for Vision Beyond Glasses • Auroville</span>
        <span className="hidden md:inline text-gold">•</span>
        <div className="hidden md:flex items-center gap-2 text-gold-light">
          <Link href="/admin" className="hover:underline flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Demo
          </Link>
          <span>/</span>
          <Link href="/therapist" className="hover:underline flex items-center gap-1 font-medium">
            <UserCheck className="w-3.5 h-3.5" /> Therapist Portal
          </Link>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-ink-border/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-plum rounded-lg p-1">
            <div className="w-10 h-10 rounded-full bg-plum flex items-center justify-center text-gold shadow-sm group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-normal text-ink tracking-tight block leading-none">
                Auro Perfect Vision
              </span>
              <span className="text-[10px] sm:text-xs font-sans tracking-widest uppercase text-gold-dark block mt-1">
                Auroville • Natural Eye Care
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-sans tracking-wide transition-colors ${
                    isActive
                      ? "text-plum font-semibold border-b-2 border-plum pb-0.5"
                      : "text-ink hover:text-plum"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/therapies">
              <Button variant="primary" size="md" className="gap-2">
                <span>Book a Session</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-ink hover:text-plum focus:outline-none focus:ring-2 focus:ring-plum rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden bg-canvas border-b border-ink-border px-6 py-6 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-serif text-ink hover:text-plum py-1 border-b border-ink-border/40"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/therapies" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Explore Therapies & Book
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Admin Console
                    </Button>
                  </Link>
                  <Link href="/therapist" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Therapist Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
