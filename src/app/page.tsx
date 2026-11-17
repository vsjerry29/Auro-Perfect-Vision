import React from "react";
import { Hero } from "@/components/public/hero";
import { PhilosophySection } from "@/components/public/philosophy-section";
import { FeaturedTherapies } from "@/components/public/featured-therapies";
import { ProcessSteps } from "@/components/public/process-steps";
import { AurovilleStory } from "@/components/public/auroville-story";
import { TeamPreview } from "@/components/public/team-preview";
import { ArticlesPreview } from "@/components/public/articles-preview";
import { BookingCtaBanner } from "@/components/public/booking-cta-banner";
import {
  getSiteContent,
  getAllOfferings,
  getAllTherapists,
  getAllBlogPosts,
} from "@/lib/server/cms";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const siteContent = getSiteContent();
  const offerings = getAllOfferings(false); // strictly published only
  const therapists = getAllTherapists(false); // strictly published only
  const blogs = getAllBlogPosts(false); // strictly published only

  return (
    <main className="flex-col">
      <Hero siteContent={siteContent} />
      <PhilosophySection />
      <FeaturedTherapies initialOfferings={offerings} />
      <ProcessSteps />
      <AurovilleStory />
      <TeamPreview initialTherapists={therapists} />
      <ArticlesPreview initialBlogs={blogs} />
      <BookingCtaBanner />
    </main>
  );
}
