"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, Shield } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TeamPreview() {
  const { therapists } = useDemoStore();

  return (
    <section className="py-20 lg:py-28 bg-canvas-light border-b border-ink-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge variant="plum" className="px-3 py-1 text-xs">
              Experienced Vision Educators
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              Guided by dedicated <span className="italic text-plum">practitioners.</span>
            </h2>
            <p className="text-sm sm:text-base text-ink-muted">
              Learn from educators committed to gentle, personalized care, ergonomic hygiene, and mindful ocular relaxation.
            </p>
          </div>

          <Link href="/team">
            <Button variant="outline" size="sm" className="gap-1.5 self-start md:self-auto">
              <span>View Full Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="bg-white rounded-2xl overflow-hidden border border-ink-border shadow-subtle hover:shadow-card transition-all p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold/40 shadow-sm">
                <img
                  src={therapist.photoUrl}
                  alt={therapist.displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2.5 flex-1">
                <div>
                  <h3 className="font-serif text-xl text-ink font-medium">
                    {therapist.displayName}
                  </h3>
                  <p className="text-xs text-gold-dark font-sans tracking-wide uppercase font-semibold">
                    {therapist.roleTitle}
                  </p>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {therapist.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {therapist.specialties.slice(0, 3).map((spec, i) => (
                    <Badge key={i} variant="faint" className="text-[10px]">
                      {spec}
                    </Badge>
                  ))}
                </div>

                <div className="pt-3">
                  <Link href={`/book/eye-yoga?therapist=${therapist.id}`}>
                    <Button variant="primary" size="sm" className="w-full sm:w-auto text-xs gap-1">
                      <span>Book with {therapist.displayName.split(" ")[0]}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
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
