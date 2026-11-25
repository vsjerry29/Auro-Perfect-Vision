"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Globe, Users, User, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { Offering } from "@/lib/types";

interface FeaturedTherapiesProps {
  initialOfferings?: Offering[];
}

export function FeaturedTherapies({ initialOfferings }: FeaturedTherapiesProps) {
  const offerings = initialOfferings || [];
  const [activeTab, setActiveTab] = useState<"all" | "individual" | "programmes">("all");

  const filteredOfferings = offerings.filter((item) => {
    if (activeTab === "individual") return !item.isFlagshipProgramme;
    if (activeTab === "programmes") return item.isFlagshipProgramme;
    return true;
  });

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Tailored Vision Care</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
              Featured Holistic Therapies
            </h2>
            <p className="font-inter text-sm sm:text-base text-brand-secondary">
              From focused 60-minute eye relaxation sessions to multi-day immersive vision camps in Pondicherry.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-brand-gray p-1.5 rounded-2xl self-start md:self-auto border border-brand-gray">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-xs font-sora font-semibold rounded-xl transition-all ${
                activeTab === "all"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-brand-secondary hover:text-brand-charcoal"
              }`}
            >
              All Offerings ({offerings.length})
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`px-4 py-2 text-xs font-sora font-semibold rounded-xl transition-all ${
                activeTab === "individual"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-brand-secondary hover:text-brand-charcoal"
              }`}
            >
              1-on-1 Sessions
            </button>
            <button
              onClick={() => setActiveTab("programmes")}
              className={`px-4 py-2 text-xs font-sora font-semibold rounded-xl transition-all ${
                activeTab === "programmes"
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-brand-secondary hover:text-brand-charcoal"
              }`}
            >
              Flagship Retreats
            </button>
          </div>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOfferings.map((offering) => {
            const priceVal = offering.price?.inr || (offering as any).priceINR || 3500;
            const durationLabel = offering.isFlagshipProgramme
              ? "7 Days / 6 Nights"
              : `${offering.durationMinutes} Minutes`;

            return (
              <div
                key={offering.id}
                className="group bg-white rounded-3xl overflow-hidden border border-brand-gray hover:border-brand-purple/40 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-gray">
                    <img
                      src={offering.imageUrl}
                      alt={offering.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {offering.isFlagshipProgramme ? (
                        <span className="px-3 py-1 bg-brand-orange text-white text-[11px] font-sora font-bold rounded-lg shadow-sm">
                          Flagship Retreat
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-brand-purple text-white text-[11px] font-sora font-bold rounded-lg shadow-sm">
                          1:1 Session
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-brand-charcoal text-[11px] font-inter font-semibold rounded-lg shadow-xs">
                        {offering.delivery === "online"
                          ? "Global Online"
                          : offering.delivery === "onsite"
                          ? "Pondicherry On-site"
                          : "Hybrid"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-brand-deep/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" />
                      <span>{durationLabel}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 space-y-2.5">
                    <h3 className="font-sora text-lg font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors leading-snug">
                      {offering.title}
                    </h3>
                    <p className="font-inter text-xs text-brand-secondary line-clamp-2 leading-relaxed">
                      {offering.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Footer with Price & Actions */}
                <div className="p-6 pt-0 border-t border-brand-gray/60 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-inter uppercase tracking-wider text-brand-secondary block font-bold">
                      Session Fee
                    </span>
                    <span className="font-sora text-lg font-extrabold text-brand-deep">
                      ₹{priceVal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/therapies/${offering.slug}`}
                      className="px-3.5 py-2 text-xs font-sora font-semibold text-brand-purple hover:bg-brand-lavender rounded-xl transition-colors"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/book/${offering.slug}`}
                      className="px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-sora font-bold rounded-xl shadow-orange-glow transition-all"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href="/therapies"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-lavender hover:bg-brand-purple hover:text-white text-brand-purple font-sora text-xs font-bold transition-all"
          >
            <span>Explore Complete Therapies Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
