import React from "react";
import Link from "next/link";
import { getAllTherapists, getAllOfferings } from "@/lib/server/cms";
import { ArrowRight, UserCheck, Sparkles, Calendar, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Specialists & Practitioners | Auro Perfect Vision",
  description: "Meet our certified Bates method vision educators and natural eyesight specialists in Auroville.",
};

export default function TeamDirectoryPage() {
  const therapists = getAllTherapists(false); // published only
  const offerings = getAllOfferings(false); // published only

  return (
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Header */}
      <section className="pt-20 pb-16 bg-white border-b border-brand-gray/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Auroville Vision Educators</span>
          </div>
          <h1 className="font-sora text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            Meet Our Dedicated <span className="text-brand-purple">Practitioners</span>
          </h1>
          <p className="font-inter text-base text-brand-secondary max-w-xl mx-auto leading-relaxed">
            Our educators combine classical Bates training with modern ocular photobiomodulation, guiding clients toward natural eye ease and mindful visual habits.
          </p>
        </div>
      </section>

      {/* Team Roster Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {therapists.map((therapist) => {
          const therapistOfferings = offerings.filter((o) =>
            therapist.assignedOfferingIds.includes(o.id)
          );

          return (
            <div
              key={therapist.id}
              className="bg-white rounded-3xl overflow-hidden border border-brand-gray/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Photo Column */}
              <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
                <div className="w-44 h-44 rounded-3xl overflow-hidden border-2 border-brand-purple/20 shadow-md bg-brand-gray">
                  <img
                    src={therapist.photoUrl}
                    alt={therapist.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-sora text-2xl font-bold text-brand-charcoal">
                    {therapist.displayName}
                  </h3>
                  <p className="font-inter text-xs font-bold text-brand-purple uppercase tracking-wider mt-1">
                    {therapist.roleTitle}
                  </p>
                  <p className="font-inter text-xs text-brand-secondary mt-1 flex items-center justify-center sm:justify-start gap-1">
                    <Award className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{therapist.qualifications}</span>
                  </p>
                </div>
              </div>

              {/* Bio & Assigned Offerings */}
              <div className="md:col-span-8 space-y-6">
                <div>
                  <h4 className="text-xs uppercase font-inter font-bold tracking-wider text-brand-secondary mb-2">
                    Biography & Experience
                  </h4>
                  <p className="font-inter text-sm text-brand-secondary leading-relaxed">
                    {therapist.bio}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-inter font-bold tracking-wider text-brand-secondary mb-2">
                    Primary Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {therapist.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-inter font-medium bg-brand-lavender text-brand-purple border border-brand-purple/10"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Offerings Handled by Practitioner */}
                <div className="pt-4 border-t border-brand-gray/80">
                  <h4 className="text-xs uppercase font-inter font-bold tracking-wider text-brand-secondary mb-3">
                    Direct Booking with {therapist.displayName.split(" ")[0]}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {therapistOfferings.map((offering) => (
                      <Link
                        key={offering.id}
                        href={`/book/${offering.slug}?therapist=${therapist.id}`}
                        className="p-3.5 rounded-2xl border border-brand-gray bg-[#FAF9FC] hover:bg-white hover:border-brand-purple/40 hover:shadow-sm transition-all flex items-center justify-between text-xs group"
                      >
                        <span className="font-sora font-semibold text-brand-charcoal group-hover:text-brand-purple truncate pr-2">
                          {offering.title}
                        </span>
                        <span className="p-1.5 rounded-xl bg-brand-orange/10 text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
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
