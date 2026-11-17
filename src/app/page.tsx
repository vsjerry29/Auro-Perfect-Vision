import React from "react";
import { Hero } from "@/components/public/hero";
import { PhilosophySection } from "@/components/public/philosophy-section";
import { FeaturedTherapies } from "@/components/public/featured-therapies";
import { ProcessSteps } from "@/components/public/process-steps";
import { AurovilleStory } from "@/components/public/auroville-story";
import { TeamPreview } from "@/components/public/team-preview";
import { ArticlesPreview } from "@/components/public/articles-preview";
import { BookingCtaBanner } from "@/components/public/booking-cta-banner";

export default function HomePage() {
  return (
    <main className="flex-col">
      <Hero />
      <PhilosophySection />
      <FeaturedTherapies />
      <ProcessSteps />
      <AurovilleStory />
      <TeamPreview />
      <ArticlesPreview />
      <BookingCtaBanner />
    </main>
  );
}
