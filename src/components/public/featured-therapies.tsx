"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, Globe, Users, User, ArrowRight } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

import { Offering } from "@/lib/types";

interface FeaturedTherapiesProps {
  initialOfferings?: Offering[];
}

export function FeaturedTherapies({ initialOfferings }: FeaturedTherapiesProps) {
  const { offerings: storeOfferings } = useDemoStore();
  const offerings = initialOfferings && initialOfferings.length > 0 ? initialOfferings : storeOfferings;
  const [activeTab, setActiveTab] = useState<"all" | "individual" | "programmes">("all");

  const filteredOfferings = offerings.filter((item) => {
    if (activeTab === "individual") return !item.isFlagshipProgramme;
    if (activeTab === "programmes") return item.isFlagshipProgramme;
    return true;
  });

  return (
    <section className="py-20 lg:py-28 bg-canvas border-b border-ink-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="gold" className="px-3 py-1 text-xs">
              Catalogue of Offerings
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              Mindfully tailored sessions & <span className="italic text-plum">flagship programmes.</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-ink-muted">
              Choose between focused 1-on-1 therapeutic consultations or multi-day guided immersive courses in Auroville.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-canvas-dark/50 p-1.5 rounded-full border border-ink-border self-start md:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "all"
                  ? "bg-plum text-white shadow-sm"
                  : "text-ink hover:text-plum"
              }`}
            >
              All Offerings
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "individual"
                  ? "bg-plum text-white shadow-sm"
                  : "text-ink hover:text-plum"
              }`}
            >
              Individual Sessions
            </button>
            <button
              onClick={() => setActiveTab("programmes")}
              className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                activeTab === "programmes"
                  ? "bg-plum text-white shadow-sm"
                  : "text-ink hover:text-plum"
              }`}
            >
              Flagship Programmes
            </button>
          </div>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOfferings.map((offering) => (
            <div
              key={offering.id}
              className="group bg-white rounded-2xl overflow-hidden border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Image Container */}
              <div className="relative h-52 overflow-hidden bg-canvas-dark">
                <img
                  src={offering.imageUrl}
                  alt={offering.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                  <Badge variant={offering.isFlagshipProgramme ? "gold" : "plum"} className="shadow-sm">
                    {offering.isFlagshipProgramme ? "Flagship Programme" : "Session"}
                  </Badge>
                  <Badge variant="sage" className="shadow-sm">
                    {offering.delivery === "online" ? "Online" : offering.delivery === "onsite" ? "On-site" : "Hybrid"}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-ink-muted mb-2.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {offering.isFlagshipProgramme || offering.durationMinutes > 180 ? (
                        <span>7-Day Retreat • {offering.durationMinutes} mins/session</span>
                      ) : (
                        <span>{offering.durationMinutes} mins</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      {offering.format === "individual" ? (
                        <>
                          <User className="w-3.5 h-3.5" /> 1-on-1
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5" /> Group ({offering.maxCapacity} max)
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-ink group-hover:text-plum transition-colors mb-2.5">
                    {offering.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-muted line-clamp-3 leading-relaxed mb-4">
                    {offering.shortDescription}
                  </p>
                </div>

                {/* Price and CTA */}
                <div className="pt-4 border-t border-ink-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-ink-faint block">
                      Sample Rate
                    </span>
                    <span className="font-serif text-lg font-medium text-ink">
                      {formatCurrency(offering.price.inr, "INR")}
                      <span className="text-xs font-sans text-ink-muted font-normal ml-1">
                        / ${offering.price.usd}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/therapies/${offering.slug}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                    <Link href={`/book/${offering.slug}`}>
                      <Button variant="primary" size="sm" className="gap-1">
                        <span>Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Catalogue CTA */}
        <div className="mt-12 text-center">
          <Link href="/therapies">
            <Button variant="outline" size="lg" className="gap-2">
              <span>View All {offerings.length} Holistic Offerings & Programmes</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
