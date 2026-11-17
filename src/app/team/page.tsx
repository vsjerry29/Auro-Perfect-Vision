import React from "react";
import Link from "next/link";
import { getAllTherapists, getAllOfferings } from "@/lib/server/cms";
import { ArrowRight, UserCheck, Shield, Sparkles, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function TeamDirectoryPage() {
  const therapists = getAllTherapists(false); // published only
  const offerings = getAllOfferings(false); // published only

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Editorial Header */}
      <section className="pt-16 pb-16 border-b border-ink-border/50 bg-canvas-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="gold" className="text-xs">
            Auroville Vision Educators
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Meet Our <span className="italic text-plum">Dedicated Practitioners</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Our educators combine classical Bates training with modern ocular photobiomodulation, guiding clients toward natural eye ease and mindful visual habits.
          </p>
        </div>
      </section>

      {/* Team Roster Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {therapists.map((therapist) => {
          // Get offerings assigned to this therapist
          const therapistOfferings = offerings.filter((o) =>
            therapist.assignedOfferingIds.includes(o.id)
          );

          return (
            <div
              key={therapist.id}
              className="bg-white rounded-3xl overflow-hidden border border-ink-border shadow-subtle p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Photo Column */}
              <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
                <div className="w-40 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-card bg-canvas-dark">
                  <img
                    src={therapist.photoUrl}
                    alt={therapist.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-medium text-ink">
                    {therapist.displayName}
                  </h3>
                  <p className="text-xs text-gold-dark font-sans tracking-wide uppercase font-semibold mt-0.5">
                    {therapist.roleTitle}
                  </p>
                  <p className="text-[11px] text-ink-muted mt-1">
                    {therapist.qualifications}
                  </p>
                </div>
              </div>

              {/* Bio & Assigned Offerings */}
              <div className="md:col-span-8 space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-sans tracking-widest text-ink-muted font-semibold mb-2">
                    Biography & Background
                  </h4>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {therapist.bio}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-sans tracking-widest text-ink-muted font-semibold mb-2">
                    Primary Specialties
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {therapist.specialties.map((spec, i) => (
                      <Badge key={i} variant="sage" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Offerings Handled by Practitioner */}
                <div className="pt-4 border-t border-ink-border/50">
                  <h4 className="text-xs uppercase font-sans tracking-widest text-ink-muted font-semibold mb-3">
                    Available Consultations with {therapist.displayName.split(" ")[0]}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {therapistOfferings.map((offering) => (
                      <Link
                        key={offering.id}
                        href={`/book/${offering.slug}?therapist=${therapist.id}`}
                        className="p-3 rounded-xl border border-ink-border bg-canvas-light/60 hover:bg-canvas-light hover:border-plum/50 transition-all flex items-center justify-between text-xs group"
                      >
                        <span className="font-medium text-ink group-hover:text-plum truncate pr-2">
                          {offering.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gold-dark flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
