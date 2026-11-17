import React from "react";
import { Hero } from "@/components/public/hero";
import { TherapyCategories } from "@/components/public/therapy-categories";
import { WhyChooseUs } from "@/components/public/why-choose-us";
import { FeaturedTherapies } from "@/components/public/featured-therapies";
import { MethodologyPerspective } from "@/components/public/methodology-perspective";
import { TeamPreview } from "@/components/public/team-preview";
import { FlagshipProgrammesPreview } from "@/components/public/flagship-programmes-preview";
import { HowItWorks } from "@/components/public/how-it-works";
import { WhatToExpect } from "@/components/public/what-to-expect";
import { VisitCentre } from "@/components/public/visit-centre";
import { ArticlesPreview } from "@/components/public/articles-preview";
import { FinalCtaBanner } from "@/components/public/final-cta-banner";
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
    <main className="flex flex-col w-full bg-white">
      {/* 1. Hero */}
      <Hero siteContent={siteContent} />

      {/* 2. Quick Therapy Discovery Rail (Lenskart-style circular photo categories) */}
      <TherapyCategories />

      {/* 3. Why Choose Us */}
      <WhyChooseUs />

      {/* 4. Featured Therapies Grid */}
      <FeaturedTherapies initialOfferings={offerings} />

      {/* 5. A Different Perspective (Integrative Vision Therapy Methodology) */}
      <MethodologyPerspective />

      {/* 6. Meet Our Specialists */}
      <TeamPreview initialTherapists={therapists} />

      {/* 7. Flagship Immersive Retreats */}
      <FlagshipProgrammesPreview />

      {/* 8. How Booking Works */}
      <HowItWorks />

      {/* 9. What to Expect (Transparent Patient Journey) */}
      <WhatToExpect />

      {/* 10. Visit Our Sanctuary in Auroville */}
      <VisitCentre />

      {/* 11. Educational Eye-Care Journal */}
      <ArticlesPreview initialBlogs={blogs} />

      {/* 12. Final Call to Action Banner */}
      <FinalCtaBanner />
    </main>
  );
}
