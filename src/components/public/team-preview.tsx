"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, Sparkles, Calendar } from "lucide-react";
import { Therapist } from "@/lib/types";

interface TeamPreviewProps {
  initialTherapists?: Therapist[];
}

export function TeamPreview({ initialTherapists }: TeamPreviewProps) {
  const therapists = initialTherapists || [];

  return (
    <section className="py-16 lg:py-24 bg-white border-b border-brand-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Certified Educators</span>
            </div>
            <h2 className="font-sora text-3xl sm:text-4xl font-bold text-brand-charcoal tracking-tight">
              Meet Our Vision Specialists
            </h2>
            <p className="font-inter text-sm sm:text-base text-brand-secondary">
              Experienced practitioners dedicated to holistic eye relaxation, visual ergonomics, and mindful sight restoration.
            </p>
          </div>

          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-gray hover:bg-brand-lavender text-brand-purple font-sora text-xs font-bold transition-colors self-start md:self-auto"
          >
            <span>View Full Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-white rounded-3xl overflow-hidden border border-brand-gray hover:border-brand-purple/40 shadow-subtle hover:shadow-card transition-all p-6 sm:p-7 flex flex-col sm:flex-row gap-6 items-center sm:items-start group"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-brand-lavender shadow-sm bg-brand-gray">
                <img
                  src={therapist.photoUrl}
                  alt={therapist.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <div>
                  <h3 className="font-sora text-xl font-bold text-brand-charcoal group-hover:text-brand-purple transition-colors">
                    {therapist.displayName}
                  </h3>
                  <p className="text-xs font-inter font-bold text-brand-orange tracking-wide uppercase mt-0.5">
                    {therapist.roleTitle}
                  </p>
                </div>

                <p className="text-xs font-inter text-brand-secondary leading-relaxed line-clamp-3">
                  {therapist.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1 justify-center sm:justify-start">
                  {therapist.specialties?.slice(0, 3).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-brand-lavender text-brand-purple font-inter text-[10px] font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-3">
                  <Link
                    href={`/book?therapist=${therapist.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-sora font-bold rounded-xl shadow-orange-glow transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with {therapist.displayName.split(" ")[0]}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
