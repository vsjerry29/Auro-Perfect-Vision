"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store";
import { Offering, OfferingFormat, OfferingDelivery, OfferingCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Search, Clock, User, Users, ArrowRight, Filter, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TherapiesCatalogueViewProps {
  initialOfferings?: Offering[];
}

export function TherapiesCatalogueView({ initialOfferings }: TherapiesCatalogueViewProps) {
  const { offerings: storeOfferings } = useDemoStore();
  const offerings = initialOfferings && initialOfferings.length > 0 ? initialOfferings : storeOfferings;

  const [search, setSearch] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = offerings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(search.toLowerCase());

    const matchesFormat =
      selectedFormat === "all" || item.format === selectedFormat;

    const matchesDelivery =
      selectedDelivery === "all" || item.delivery === selectedDelivery || item.delivery === "hybrid";

    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;

    return matchesSearch && matchesFormat && matchesDelivery && matchesCategory;
  });

  const handleResetFilters = () => {
    setSearch("");
    setSelectedFormat("all");
    setSelectedDelivery("all");
    setSelectedCategory("all");
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <section className="pt-16 pb-16 border-b border-ink-border/50 bg-canvas-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="gold" className="text-xs">
            Auroville Centre for Vision Beyond Glasses
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Therapies & <span className="italic text-plum">Flagship Programmes</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Browse our comprehensive directory of natural vision therapies, digital screen recovery, and immersive residential retreats in Auroville.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-ink-border shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search eye yoga, stress relief, retreats..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            >
              <option value="all">All Formats</option>
              <option value="individual">1-on-1 Individual</option>
              <option value="group">Group / Programme</option>
            </select>

            {/* Delivery Filter */}
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            >
              <option value="all">All Locations</option>
              <option value="onsite">Auroville On-site</option>
              <option value="online">Online / Remote</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-ink-border bg-canvas-light text-ink focus:outline-none focus:ring-2 focus:ring-plum"
            >
              <option value="all">All Categories</option>
              <option value="natural_vision_improvement">Natural Vision Improvement</option>
              <option value="digital_eye_strain">Digital Eye Strain</option>
              <option value="children_vision_habits">Children Vision Habits</option>
              <option value="bates_method_relaxation">Bates Method Relaxation</option>
              <option value="photobiomodulation">Photobiomodulation</option>
              <option value="residential_retreat">Residential Retreat</option>
            </select>

            {(search || selectedFormat !== "all" || selectedDelivery !== "all" || selectedCategory !== "all") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-plum font-medium hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Catalogue Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            Showing <span className="font-semibold text-ink">{filtered.length}</span> published offerings & courses
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-ink-border p-12 text-center max-w-lg mx-auto space-y-3">
            <Filter className="w-8 h-8 text-ink-faint mx-auto" />
            <h3 className="font-serif text-lg text-ink">No therapies found</h3>
            <p className="text-xs text-ink-muted">
              We couldn't find any sessions matching your filter criteria. Try clearing some filters.
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((offering) => (
              <div
                key={offering.id}
                className="group bg-white rounded-2xl overflow-hidden border border-ink-border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Photo & Badges */}
                <div className="relative h-56 overflow-hidden bg-canvas-dark">
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

                {/* Information */}
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

                  {/* Price & Actions */}
                  <div className="pt-4 border-t border-ink-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-ink-faint block">
                        Rate
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
        )}
      </div>
    </div>
  );
}
