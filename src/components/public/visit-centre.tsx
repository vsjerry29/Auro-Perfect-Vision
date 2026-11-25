"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Navigation,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface VisitCentreProps {
  siteContent?: {
    address?: string;
    phone?: string;
    contactPhoneSecondary?: string;
    contactWhatsApp?: string;
    email?: string;
    openingHours?: string;
  };
}

export function VisitCentre({ siteContent }: VisitCentreProps) {
  const address = siteContent?.address || "Tresor Nursing Home, 9, St Louis St, White Town, Puducherry – 605001, India.";
  const phone = siteContent?.phone || "+91 94897 63451";
  const email = siteContent?.email || "auroperfectvision@gmail.com";
  const hours = siteContent?.openingHours || "Monday - Saturday: 9:00 AM - 5:30 PM IST (Closed Sundays)";

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Centre Contact Info */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              <span>Pondicherry Centre • White Town</span>
            </div>

            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
              Visit Auro Perfect Vision (APV)
            </h2>

            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Located in historic White Town, Puducherry. Visitors and families are welcomed into a modern clinical setting engineered for comprehensive eye care, vision therapy, and natural wellness.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sora text-xs font-bold text-brand-charcoal block">
                    Clinic Address
                  </span>
                  <span className="font-inter text-xs text-brand-secondary leading-relaxed">
                    {address}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sora text-xs font-bold text-brand-charcoal block">
                    Practice & Consulting Hours
                  </span>
                  <span className="font-inter text-xs text-brand-secondary leading-relaxed">
                    {hours}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sora text-xs font-bold text-brand-charcoal block">
                    Direct Telephone
                  </span>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                    className="font-inter text-xs font-semibold text-brand-purple hover:underline leading-relaxed inline-block"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs font-bold shadow-sm transition-all"
              >
                <span>Book an Appointment</span>
              </Link>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-gray hover:bg-brand-lavender text-brand-purple font-sora text-xs font-bold transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-3 text-xs font-sora font-semibold text-brand-purple hover:underline"
              >
                <span>Send Online Inquiry &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Location Map & Address Preview */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-elevated bg-brand-gray aspect-[16/11] flex flex-col">
              <iframe
                title="Auro Perfect Vision (APV) — White Town, Puducherry Location Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent("Tresor Nursing Home, 9, St Louis St, White Town, Puducherry 605001, India")}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0 flex-1"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="bg-brand-deep text-white px-5 py-3.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-inter uppercase tracking-wider text-brand-orange font-bold block">
                    Historic White Town, Puducherry
                  </span>
                  <span className="font-sora text-sm font-bold block">
                    Tresor Nursing Home, 9, St Louis St
                  </span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-sora font-semibold text-brand-orange hover:text-white transition-colors"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
