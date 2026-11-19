"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Calendar,
  Sparkles,
  ArrowRight,
  Eye,
  Activity,
  Heart,
  Compass,
  Phone,
  MessageCircle,
} from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [therapiesDropdown, setTherapiesDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setTherapiesDropdown(false);
  }, [pathname]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTherapiesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Exclude administrative dashboards safely after all hooks are called
  const isDashboard = Boolean(
    pathname &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/therapist") ||
        pathname.startsWith("/staff"))
  );
  if (isDashboard) return null;

  // Real slugs matching data/cms/offerings.json
  const featuredTherapiesList = [
    {
      title: "Eye Yoga for Children & Adults",
      slug: "eye-yoga",
      desc: "Gentle muscular retraining, palming & mobility",
    },
    {
      title: "Digital Screen Strain Recovery",
      slug: "vision-stress-relief",
      desc: "Deep relief for asthenopia, blur & glare fatigue",
    },
    {
      title: "Customized Vision Therapy",
      slug: "customized-vision-therapy",
      desc: "Bespoke 1-on-1 personalized visual roadmap",
    },
    {
      title: "Dry Eye & Photobiomodulation",
      slug: "dry-eye-red-light-therapy",
      desc: "Safe cellular red-light frequency stimulation",
    },
    {
      title: "Visual Skill Enhancement",
      slug: "visual-skill-enhancement",
      desc: "Fine-tune visual memory, tracking & coordination",
    },
    {
      title: "7-Day Residential Vision Camp",
      slug: "retreat-holistic-vision-awakening",
      desc: "Immersive nature & eye retreat in Auroville",
    },
  ];

  return (
    <>
      {/* Top Value Strip */}
      <div className="bg-brand-deep text-white text-[11px] sm:text-xs py-2 px-4 font-inter tracking-wide border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            <span className="font-medium text-white/95 truncate">
              Auro Perfect Vision • Auroville Centre for Vision Beyond Glasses
            </span>
          </div>
          <div className="hidden md:flex items-center gap-5 text-white/80">
            <a
              href="https://wa.me/918012305151"
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand-orange flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: +91 80123 05151</span>
            </a>
            <span className="text-white/30">•</span>
            <span className="text-white/70">Mon – Sat: 9:00 AM – 5:30 PM IST</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-card border-b border-brand-gray py-1.5 sm:py-2"
            : "bg-white border-b border-brand-gray/80 py-2 sm:py-2.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link
            href="/"
            className="flex items-center group focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-xl p-0.5 sm:p-1"
            aria-label="Auro Perfect Vision"
          >
            <div
              className={`relative shrink-0 flex items-center justify-center transition-all duration-300 ${
                scrolled
                  ? "h-12 sm:h-14 lg:h-16 w-auto"
                  : "h-14 sm:h-16 lg:h-[78px] w-auto"
              }`}
            >
              <img
                src="/images/logo.webp"
                alt="Auro Perfect Vision"
                className="h-full w-auto max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            <Link
              href="/"
              className={`text-sm font-inter font-medium tracking-wide transition-colors ${
                pathname === "/" ? "text-brand-purple font-semibold" : "text-brand-charcoal hover:text-brand-purple"
              }`}
            >
              Home
            </Link>

            <Link
              href="/about"
              className={`text-sm font-inter font-medium tracking-wide transition-colors ${
                pathname === "/about" ? "text-brand-purple font-semibold" : "text-brand-charcoal hover:text-brand-purple"
              }`}
            >
              About
            </Link>

            {/* Therapies Dropdown */}
            <div
              ref={dropdownRef}
              className="relative py-2"
              onMouseEnter={() => setTherapiesDropdown(true)}
              onMouseLeave={() => setTherapiesDropdown(false)}
            >
              <div className="flex items-center gap-1">
                <Link
                  href="/therapies"
                  onClick={() => setTherapiesDropdown(false)}
                  className={`text-sm font-inter font-medium tracking-wide transition-colors ${
                    pathname.startsWith("/therapies")
                      ? "text-brand-purple font-semibold"
                      : "text-brand-charcoal hover:text-brand-purple"
                  }`}
                >
                  Therapies & Retreats
                </Link>
                <button
                  type="button"
                  aria-expanded={therapiesDropdown}
                  aria-label="Toggle therapies menu"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTherapiesDropdown((prev) => !prev);
                  }}
                  className="p-1 rounded-md text-brand-secondary hover:text-brand-purple focus:outline-none"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      therapiesDropdown ? "rotate-180 text-brand-purple" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Flyout Mega Menu */}
              {therapiesDropdown && (
                <div
                  className="absolute top-full left-0 w-84 bg-white rounded-2xl shadow-[0_12px_40px_rgba(75,29,143,0.15)] border border-brand-gray/80 p-3 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                  onMouseEnter={() => setTherapiesDropdown(true)}
                >
                  <div className="px-3 py-1.5 border-b border-brand-gray/80 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-inter uppercase tracking-wider text-brand-secondary font-bold">
                      Popular Holistic Sessions
                    </span>
                    <span className="text-[10px] bg-brand-lavender text-brand-purple font-sora font-semibold px-2 py-0.5 rounded-full">
                      Auroville & Online
                    </span>
                  </div>
                  <div className="space-y-1">
                    {featuredTherapiesList.map((t) => (
                      <Link
                        key={t.slug}
                        href={`/therapies/${t.slug}`}
                        onClick={() => setTherapiesDropdown(false)}
                        className="p-2.5 rounded-xl hover:bg-brand-lavender/60 transition-colors block group"
                      >
                        <div className="text-xs font-sora font-semibold text-brand-charcoal group-hover:text-brand-purple flex items-center justify-between">
                          <span>{t.title}</span>
                          <ArrowRight className="w-3 h-3 text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[11px] text-brand-secondary mt-0.5 line-clamp-1 font-inter">
                          {t.desc}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-brand-gray/80 px-2 flex justify-between items-center text-xs">
                    <Link
                      href="/therapies"
                      onClick={() => setTherapiesDropdown(false)}
                      className="text-brand-purple font-sora font-semibold hover:text-brand-violet flex items-center gap-1 text-[11px]"
                    >
                      View All 6 Therapies &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/team"
              className={`text-sm font-inter font-medium tracking-wide transition-colors ${
                pathname === "/team" ? "text-brand-purple font-semibold" : "text-brand-charcoal hover:text-brand-purple"
              }`}
            >
              Our Team
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-inter font-medium tracking-wide transition-colors ${
                pathname === "/contact" ? "text-brand-purple font-semibold" : "text-brand-charcoal hover:text-brand-purple"
              }`}
            >
              Contact
            </Link>

            <Link
              href="/blogs"
              className={`text-xs font-inter text-brand-secondary hover:text-brand-purple transition-colors px-2.5 py-1 rounded-md hover:bg-brand-gray ${
                pathname.startsWith("/blogs") ? "text-brand-purple font-semibold bg-brand-lavender/50" : ""
              }`}
            >
              Journal
            </Link>
          </nav>

          {/* Action Orange Booking CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/therapies"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs font-bold tracking-wide shadow-orange-glow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-brand-charcoal hover:text-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple rounded-xl border border-brand-gray"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-brand-gray px-6 py-6 animate-in slide-in-from-top-3 duration-200 shadow-elevated max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col gap-3 font-inter">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-lavender/50 hover:text-brand-purple"
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-lavender/50 hover:text-brand-purple"
              >
                About Our Approach
              </Link>
              <Link
                href="/therapies"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-semibold text-brand-purple bg-brand-lavender/40 flex justify-between items-center"
              >
                <span>Therapies & Retreats</span>
                <span className="text-[10px] font-mono bg-brand-purple text-white px-2 py-0.5 rounded-full">
                  6 Services
                </span>
              </Link>

              {/* Sub-therapies */}
              <div className="pl-4 space-y-1.5 border-l-2 border-brand-lavender">
                {featuredTherapiesList.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/therapies/${t.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-1.5 px-2 text-xs text-brand-secondary hover:text-brand-purple"
                  >
                    • {t.title}
                  </Link>
                ))}
              </div>

              <Link
                href="/team"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-lavender/50 hover:text-brand-purple"
              >
                Meet Our Specialists
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-sm font-medium text-brand-charcoal hover:bg-brand-lavender/50 hover:text-brand-purple"
              >
                Visit & Contact
              </Link>
              <Link
                href="/blogs"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 px-3 rounded-lg text-xs font-medium text-brand-secondary hover:bg-brand-lavender/50 hover:text-brand-purple"
              >
                Eye Wellness Journal & Articles
              </Link>

              {/* Mobile Booking CTA */}
              <div className="pt-4 mt-2 border-t border-brand-gray space-y-2">
                <Link
                  href="/therapies"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-brand-orange text-white rounded-xl font-sora text-sm font-bold shadow-orange-glow"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                </Link>
                <div className="text-center text-[11px] text-brand-secondary">
                  Auroville, Tamil Nadu • +91 80123 05151
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
