"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  MessageCircle,
  Shield,
  Heart,
  ArrowRight,
  Lock,
} from "lucide-react";

export function SiteFooter() {
  const pathname = usePathname();

  // Exclude administrative dashboards safely
  const isDashboard = Boolean(
    pathname &&
      (pathname.startsWith("/admin") ||
        pathname.startsWith("/therapist") ||
        pathname.startsWith("/staff"))
  );
  if (isDashboard) return null;

  return (
    <footer className="bg-brand-charcoal text-white font-inter border-t border-brand-gray/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Logo (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="h-14 w-auto bg-white rounded-xl px-2.5 py-1.5 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src="/images/logo.webp"
                  alt="Auro Perfect Vision"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-sora text-xl font-bold tracking-tight text-white block">
                  Auro Perfect <span className="text-brand-orange">Vision</span>
                </span>
                <span className="text-[10px] font-inter uppercase tracking-widest text-white/60 block font-semibold">
                  Auroville Centre for Vision Beyond Glasses
                </span>
              </div>
            </Link>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Dedicated to natural vision improvement, mindful eye relaxation, Bates exercises, and digital screen recovery for children and adults worldwide. Rooted in the serene environment of Auroville, Tamil Nadu.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/918012305151"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs hover:bg-emerald-600/30 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href="tel:+918012305151"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white/90 border border-white/15 text-xs hover:bg-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91 80123 05151</span>
              </a>
            </div>
          </div>

          {/* Column 2: Holistic Therapies */}
          <div className="space-y-3">
            <h4 className="font-sora text-xs font-bold tracking-wider uppercase text-brand-orange">
              Therapies & Retreats
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/therapies/eye-yoga" className="hover:text-white transition-colors">
                  Eye Yoga (All Ages)
                </Link>
              </li>
              <li>
                <Link href="/therapies/vision-stress-relief" className="hover:text-white transition-colors">
                  Digital Screen Relief
                </Link>
              </li>
              <li>
                <Link href="/therapies/customized-vision-therapy" className="hover:text-white transition-colors">
                  Customized Vision Therapy
                </Link>
              </li>
              <li>
                <Link href="/therapies/visual-skill-enhancement" className="hover:text-white transition-colors">
                  Visual Skill Enhancement
                </Link>
              </li>
              <li>
                <Link href="/therapies/dry-eye-red-light-therapy" className="hover:text-white transition-colors">
                  Dry Eye Photobiomodulation
                </Link>
              </li>
              <li>
                <Link href="/therapies/retreat-holistic-vision-awakening" className="hover:text-white transition-colors font-medium text-brand-violet">
                  7-Day Residential Eye Camp
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="space-y-3">
            <h4 className="font-sora text-xs font-bold tracking-wider uppercase text-brand-orange">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Philosophy & Approach
                </Link>
              </li>
              <li>
                <Link href="/therapies" className="hover:text-white transition-colors">
                  All Therapies Catalogue
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  Meet Our Vision Guides
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-white transition-colors">
                  Eye Wellness Journal
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Location & Contact
                </Link>
              </li>
              <li>
                <Link href="/therapies" className="hover:text-white transition-colors text-brand-orange font-semibold">
                  Book an Appointment &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Auroville */}
          <div className="space-y-3">
            <h4 className="font-sora text-xs font-bold tracking-wider uppercase text-brand-orange">
              Sanctuary Details
            </h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>Auro Perfect Vision Centre, Auroville, Tamil Nadu 605101, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span>+91 80123 05151 / +91 94880 05685</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a href="mailto:auroperfectvision@gmail.com" className="hover:text-white transition-colors">
                  auroperfectvision@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span>Mon – Sat: 9:00 AM – 5:30 PM IST (Closed Sundays)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory & Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="text-[11px] max-w-2xl leading-relaxed text-white/40">
            <strong>Advisory Notice:</strong> Auro Perfect Vision provides holistic eye yoga, relaxation education, and complementary vision wellness therapies. We do not perform surgical procedures or dispense prescription medication. Consult an ophthalmologist for acute pathology.
          </p>

          <div className="flex items-center gap-4 text-[11px] shrink-0">
            <span>&copy; {new Date().getFullYear()} Auro Perfect Vision.</span>
            <span>•</span>
            <Link href="/staff/login" className="hover:text-white/80 transition-colors flex items-center gap-1 text-[10px]">
              <Lock className="w-2.5 h-2.5" /> Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
