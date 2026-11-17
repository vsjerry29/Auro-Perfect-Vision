"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  imageUrl: string;
  badge?: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: "eye-yoga",
    name: "Classical Eye Yoga",
    slug: "eye-yoga",
    tagline: "Muscular flexibility, sunning & palming",
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=600&q=80",
    badge: "Popular",
  },
  {
    id: "digital-strain",
    name: "Digital Screen Relief",
    slug: "vision-stress-relief",
    tagline: "Beat asthenopia, blur & monitor fatigue",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    badge: "Workplace",
  },
  {
    id: "vision-therapy",
    name: "Vision Therapy",
    slug: "customized-vision-therapy",
    tagline: "Convergence, tracking & binocular unity",
    imageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photobiomodulation",
    name: "Dry Eye Light Therapy",
    slug: "dry-eye-red-light-therapy",
    tagline: "Cellular photobiomodulation & tear film",
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
    badge: "Specialized",
  },
  {
    id: "skill-enhancement",
    name: "Visual Skill Training",
    slug: "visual-skill-enhancement",
    tagline: "Sports reaction & peripheral awareness",
    imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "retreat",
    name: "7-Day Residential Camp",
    slug: "retreat-holistic-vision-awakening",
    tagline: "Immersive nature vision stay in Auroville",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
    badge: "Flagship",
  },
];

export function TherapyCategories() {
  return (
    <section className="py-12 lg:py-16 bg-brand-offwhite border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-inter font-bold uppercase tracking-wider text-brand-orange mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Holistic Pathways</span>
            </div>
            <h2 className="font-sora text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Quick Therapy Discovery
            </h2>
          </div>
          <Link
            href="/therapies"
            className="text-xs font-sora font-bold text-brand-purple hover:text-brand-violet flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Rail / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/therapies/${cat.slug}`}
              className="bg-white p-3.5 rounded-2xl border border-brand-gray hover:border-brand-purple/40 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col items-center text-center group transform hover:-translate-y-1"
            >
              {/* Circular Photo Thumbnail */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-brand-lavender group-hover:border-brand-orange transition-colors">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {cat.badge && (
                  <span className="absolute bottom-0 inset-x-0 bg-brand-deep/80 text-white text-[9px] font-sora font-semibold py-0.5 uppercase tracking-wide">
                    {cat.badge}
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <h3 className="font-sora text-xs sm:text-sm font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors leading-tight mb-1">
                {cat.name}
              </h3>
              <p className="text-[11px] font-inter text-brand-secondary line-clamp-2 leading-relaxed">
                {cat.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
