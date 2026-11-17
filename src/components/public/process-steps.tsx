import React from "react";
import { Search, Calendar, FileText, CheckCircle2 } from "lucide-react";

export function ProcessSteps() {
  const steps = [
    {
      step: "01",
      icon: Search,
      title: "Discover Your Therapy",
      description: "Browse our dynamic catalogue of Eye Yoga, stress relief, and flagship retreats suited to your lifestyle.",
    },
    {
      icon: Calendar,
      step: "02",
      title: "Select Therapist & Slot",
      description: "Choose an accredited practitioner and pick an genuinely open slot on our real-time availability calendar.",
    },
    {
      icon: FileText,
      step: "03",
      title: "Confidential Intake",
      description: "Answer session-specific questions regarding screen habits and eye wellness. Zero account login required.",
    },
    {
      icon: CheckCircle2,
      step: "04",
      title: "Confirm & Receive Invoice",
      description: "Pay securely online or choose to pay at the centre. Receive immediate WhatsApp and email confirmations with PDF invoice.",
    },
  ];

  return (
    <section className="py-20 bg-canvas-light border-b border-ink-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-sans tracking-widest text-gold-dark font-semibold">
            Seamless Guest Experience
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
            How booking works in <span className="italic text-plum">four mindful steps.</span>
          </h2>
          <p className="text-sm text-ink-muted">
            Designed for ease and absolute privacy. No app downloads or mandatory account creation required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-white p-6 rounded-2xl border border-ink-border shadow-subtle flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif text-3xl text-gold-light/60 font-light">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-plum/5 text-plum flex items-center justify-center">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
