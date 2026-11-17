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
  const address = siteContent?.address || "Auro Perfect Vision Centre, Auroville, Tamil Nadu 605101, India";
  const phone = siteContent?.phone || "+91 80123 05151";
  const phoneSecondary = siteContent?.contactPhoneSecondary || "+91 94880 05685";
  const wa = siteContent?.contactWhatsApp || "+91 8012305151";
  const email = siteContent?.email || "connect@auroperfectvision.com";
  const hours = siteContent?.openingHours || "Monday - Saturday: 9:00 AM - 5:30 PM IST (Closed Sundays)";

  const cleanWa = wa.replace(/[^0-9]/g, "");

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Centre Contact Info */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auroville International Sanctuary</span>
            </div>

            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
              Visit Auro Perfect Vision
            </h2>

            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Located amidst the peaceful green belt of Auroville. Visitors and residential participants are welcomed into a serene setting engineered for optic rest and natural recovery.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-sora text-xs font-bold text-brand-charcoal block">
                    Sanctuary Address
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
                  <span className="font-inter text-xs text-brand-secondary leading-relaxed">
                    {phone} • {phoneSecondary}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sora text-xs font-bold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

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

          {/* Right Column: Visual Map / Sanctuary Preview */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-elevated bg-brand-gray aspect-[16/11]">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
                alt="Auroville Sanctuary and surroundings"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-brand-deep/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-inter uppercase tracking-wider text-brand-orange font-bold">
                  Peaceful Forest Environs
                </span>
                <h3 className="font-sora text-xl font-bold mt-1">
                  Auroville International Township
                </h3>
                <p className="text-xs text-white/80 mt-1 line-clamp-2">
                  Minutes from the Matrimandir peaceful zones. Complete residential lodging available for multi-day participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
