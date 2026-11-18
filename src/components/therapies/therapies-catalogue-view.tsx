"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store";
import { Offering } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Clock,
  User,
  Users,
  ArrowRight,
  Filter,
  Sparkles,
  MapPin,
  Globe,
  CheckCircle,
  X,
} from "lucide-react";

interface TherapiesCatalogueViewProps {
  initialOfferings?: Offering[];
}

export function TherapiesCatalogueView({ initialOfferings }: TherapiesCatalogueViewProps) {
  const { offerings: storeOfferings } = useDemoStore();
  const offerings = initialOfferings && initialOfferings.length > 0 ? initialOfferings : storeOfferings;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Therapies" },
    { id: "natural_vision_improvement", label: "Eye Yoga & Bates" },
    { id: "digital_eye_strain", label: "Digital Screen Relief" },
    { id: "children_vision_habits", label: "Pediatric Vision" },
    { id: "photobiomodulation", label: "Red Light & Tech" },
    { id: "residential_retreat", label: "Auroville Retreats" },
  ];

  const filtered = useMemo(() => {
    return offerings.filter((item) => {
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
  }, [offerings, search, selectedCategory, selectedDelivery, selectedFormat]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedDelivery("all");
    setSelectedFormat("all");
  };

  const isFiltering = search || selectedCategory !== "all" || selectedDelivery !== "all" || selectedFormat !== "all";

  return (
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Header Section */}
      <section className="pt-16 pb-12 bg-white border-b border-brand-gray/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auroville Centre for Vision Beyond Glasses</span>
            </div>
            <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal tracking-tight">
              Explore Vision Therapies & <span className="text-brand-purple">Programmes</span>
            </h1>
            <p className="font-inter text-base text-brand-secondary leading-relaxed">
              Discover non-invasive optical conditioning, Bates relaxation methods, and intensive vision retreats tailored for students, screen professionals, and children.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Pills (Lenskart Inspired) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => {
            const count = cat.id === "all" 
              ? offerings.length 
              : offerings.filter(o => o.category === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-sora font-semibold transition-all border flex items-center gap-2 ${
                  isActive
                    ? "bg-brand-purple text-white border-brand-purple shadow-sm"
                    : "bg-white text-brand-charcoal border-brand-gray hover:border-brand-purple/40 hover:bg-brand-lavender/30"
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-brand-gray text-brand-secondary"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: Search + Delivery + Format */}
        <div className="mt-4 bg-white p-4 rounded-2xl border border-brand-gray/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-secondary absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search eye yoga, screen relief, residential camps..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-inter rounded-xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal placeholder-brand-secondary/70 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-brand-secondary hover:text-brand-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Delivery Location */}
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-inter font-medium rounded-xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="onsite">Auroville On-site</option>
              <option value="online">Online Video Consult</option>
            </select>

            {/* Format */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3.5 py-2.5 text-xs font-inter font-medium rounded-xl border border-brand-gray bg-[#FAF9FC] text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-purple/50 cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="individual">1-on-1 Individual</option>
              <option value="group">Group / Retreat</option>
            </select>

            {isFiltering && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-sora font-semibold text-brand-purple hover:text-brand-violet hover:underline"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-xs font-inter text-brand-secondary">
          <span>
            Showing <strong className="text-brand-charcoal font-semibold">{filtered.length}</strong> available vision therapies & programmes
          </span>
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-brand-gray p-12 text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-12 h-12 rounded-full bg-brand-lavender text-brand-purple flex items-center justify-center mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-sora text-lg font-bold text-brand-charcoal">No sessions match your search</h3>
            <p className="font-inter text-xs text-brand-secondary leading-relaxed">
              We couldn&apos;t find any vision therapies with the current filter combination. Try clearing your search query or selecting &quot;All Categories&quot;.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-sora font-semibold hover:bg-brand-violet transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((offering) => {
              const isFlagship = offering.isFlagshipProgramme || offering.durationMinutes > 180;

              return (
                <div
                  key={offering.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-brand-gray/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(75,29,143,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-gray">
                    <img
                      src={offering.imageUrl}
                      alt={offering.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {/* Floating Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-sora font-semibold shadow-sm ${
                        isFlagship
                          ? "bg-brand-orange text-white"
                          : "bg-white/95 backdrop-blur-sm text-brand-purple"
                      }`}>
                        {isFlagship ? "Flagship Retreat" : "Individual Care"}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-inter font-medium bg-black/60 backdrop-blur-sm text-white flex items-center gap-1">
                        {offering.delivery === "online" ? (
                          <>
                            <Globe className="w-3 h-3 text-sky-400" /> Online
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3 text-brand-orange" /> Auroville
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Session Meta */}
                      <div className="flex items-center gap-3 text-xs font-inter text-brand-secondary mb-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-brand-purple" />
                          {isFlagship ? "7-Day Camp" : `${offering.durationMinutes} mins`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {offering.format === "individual" ? (
                            <>
                              <User className="w-3.5 h-3.5 text-brand-purple" /> 1-on-1 Guidance
                            </>
                          ) : (
                            <>
                              <Users className="w-3.5 h-3.5 text-brand-purple" /> Cohort Group
                            </>
                          )}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/therapies/${offering.slug}`} className="block group-hover:text-brand-purple transition-colors">
                        <h3 className="font-sora text-lg sm:text-xl font-bold text-brand-charcoal leading-snug mb-2">
                          {offering.title}
                        </h3>
                      </Link>

                      {/* Short Description */}
                      <p className="font-inter text-xs sm:text-sm text-brand-secondary line-clamp-2 leading-relaxed mb-4">
                        {offering.shortDescription}
                      </p>
                    </div>

                    {/* Price and Action Strip */}
                    <div className="pt-4 border-t border-brand-gray/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-inter font-bold tracking-wider text-brand-secondary block">
                          Fee
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-sora text-xl font-extrabold text-brand-purple">
                            {formatCurrency(offering.price.inr, "INR")}
                          </span>
                          <span className="text-[11px] font-inter text-brand-secondary">
                            / ${offering.price.usd}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/therapies/${offering.slug}`}
                          className="px-3 py-2 rounded-xl text-xs font-sora font-semibold text-brand-charcoal bg-brand-gray hover:bg-brand-lavender hover:text-brand-purple transition-colors"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/book/${offering.slug}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sora font-bold text-white bg-brand-orange hover:bg-brand-orangeHover shadow-sm hover:shadow transition-all"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
