import React from "react";
import type { Metadata } from "next";
import { getEffectiveOfferings } from "@/lib/server/cms";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Calendar, Clock, Mail, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Your Appointment | Auro Perfect Vision (APV) — Pondicherry",
  description:
    "Schedule your personalized eye care or vision therapy session in one seamless booking workflow at Auro Perfect Vision (APV), Pondicherry.",
};

interface BookPageProps {
  searchParams?: Promise<{
    therapy?: string;
    therapist?: string;
  }>;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const sp = await searchParams;
  const offerings = await getEffectiveOfferings(false);
  const publishedTherapies = offerings.filter(
    (item) =>
      item.isPublished &&
      !(item as { isArchived?: boolean }).isArchived &&
      (item as { status?: string }).status !== "archived"
  );

  return (
    <main className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Page Header */}
      <section className="pt-14 pb-10 bg-white border-b border-brand-gray/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              <span>Auro Perfect Vision (APV) • Pondicherry</span>
            </div>
            <h1 className="font-sora text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal tracking-tight">
              Book Your Appointment
            </h1>
            <p className="font-inter text-sm sm:text-base text-brand-secondary leading-relaxed">
              Select your preferred therapy, practitioner, and consultation slot below. No advance online payment is required—your request goes directly to our clinic team for confirmation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Single-Flow Booking Workspace */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {publishedTherapies.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-gray p-12 text-center max-w-lg mx-auto space-y-4">
            <Calendar className="w-8 h-8 text-brand-purple mx-auto" />
            <h2 className="font-sora text-xl font-bold text-brand-charcoal">
              No Therapies Currently Open for Online Booking
            </h2>
            <p className="font-inter text-sm text-brand-secondary leading-relaxed">
              Please call our Pondicherry clinic desk at{" "}
              <a
                href="tel:+919489763451"
                className="font-semibold text-brand-purple hover:underline"
              >
                +91 94897 63451
              </a>{" "}
              for appointment assistance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            <div className="lg:col-span-8">
              <BookingWizard
                allowTherapySelection={true}
                offerings={publishedTherapies}
                initialOfferingSlug={sp?.therapy}
                initialTherapistId={sp?.therapist}
              />
            </div>

            {/* Helpful Pondicherry Centre Information Sidebar */}
            <aside className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl border border-brand-gray/80 p-6 shadow-sm space-y-4">
                <h2 className="font-sora text-base font-bold text-brand-charcoal">
                  Centre Information
                </h2>

                <div className="space-y-3.5 text-xs font-inter text-brand-secondary">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">
                        Auro Perfect Vision (APV)
                      </span>
                      <span>
                        Tresor Nursing Home, 9, St Louis St, White Town, Puducherry – 605001, India.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-brand-charcoal block">
                        Clinic Hours
                      </span>
                      <span>Monday – Saturday: 9:00 AM – 5:30 PM IST (Closed Sundays)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-brand-purple shrink-0" />
                    <a
                      href="tel:+919489763451"
                      className="font-semibold text-brand-charcoal hover:text-brand-purple transition-colors"
                    >
                      +91 94897 63451
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-brand-purple shrink-0" />
                    <a
                      href="mailto:auroperfectvision@gmail.com"
                      className="font-semibold text-brand-charcoal hover:text-brand-purple transition-colors"
                    >
                      auroperfectvision@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-brand-lavender/40 rounded-3xl border border-brand-purple/20 p-6 space-y-2.5">
                <div className="flex items-center gap-2 font-sora text-xs font-bold text-brand-purple">
                  <ShieldCheck className="w-4 h-4 text-brand-orange" />
                  <span>Direct Clinic Approval Workflow</span>
                </div>
                <p className="text-xs font-inter text-brand-secondary leading-relaxed">
                  All appointment requests are reviewed by our clinical coordinators. Once approved, you will receive an instant email confirmation and your reference number to track status anytime.
                </p>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
