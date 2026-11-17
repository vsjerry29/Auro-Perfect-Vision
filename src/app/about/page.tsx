import React from "react";
import Link from "next/link";
import { ArrowRight, Eye, Sparkles, Trees, Heart, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | Auro Perfect Vision — Centre for Vision Beyond Glasses",
  description:
    "Our philosophy, educational Bates and yogic methodology, and our roots in the intentional township of Auroville.",
};

export default function AboutPage() {
  return (
    <div className="bg-canvas">
      {/* Editorial Hero */}
      <section className="pt-16 pb-20 border-b border-ink-border/50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <Badge variant="gold" className="text-xs">
            Our Purpose & Origins
          </Badge>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-tight">
            Nurturing sight as a <span className="italic text-plum">conscious, living sense.</span>
          </h1>

          <p className="font-sans text-base sm:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Auro Perfect Vision was established in Auroville with a simple yet profound conviction: the eyes are dynamic organs capable of relaxation, flexibility, and sustained comfort when given mindful care.
          </p>
        </div>
      </section>

      {/* Main Story & Values */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Story Block 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-sans uppercase tracking-widest text-gold-dark font-semibold">
              The Auroville Connection
            </span>
            <h2 className="font-serif text-3xl text-ink font-normal">
              An ecosystem of holistic living and human unity.
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Situated in the international universal township of Auroville, our centre draws deeply from the spirit of integral education pioneered by Sri Aurobindo and The Mother. Rather than viewing eye fatigue as an isolated optical malfunction, we approach it within the context of total human wellbeing — physical relaxation, mental stillness, and harmony with natural light.
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Our quiet facility is surrounded by lush red soil, ancient banyan trees, and tranquil walking trails that invite the eyes to gaze into natural distance.
            </p>
          </div>
          <div className="md:col-span-6 rounded-2xl overflow-hidden shadow-card border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80"
              alt="Serene natural setting in Auroville"
              className="w-full h-80 object-cover"
            />
          </div>
        </div>

        {/* Story Block 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center md:flex-row-reverse">
          <div className="md:col-span-6 rounded-2xl overflow-hidden shadow-card border-4 border-white md:order-last">
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80"
              alt="Palming and relaxation practice"
              className="w-full h-80 object-cover"
            />
          </div>
          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-sans uppercase tracking-widest text-gold-dark font-semibold">
              Our Integrated Methods
            </span>
            <h2 className="font-serif text-3xl text-ink font-normal">
              Gentle practices rooted in classical vision education.
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Our methodology harmonizes classical Bates relaxation routines (palming, sunning, shifting) with contemporary ocular photobiomodulation (red light therapy) and digital ergonomic hygiene.
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              We guide children struggling with early near-point strain and adults facing prolonged monitor glare to rebuild relaxed accommodation habits, effortless blinking reflexes, and peripheral visual breadth.
            </p>
          </div>
        </div>

        {/* Health Responsibility & Disclaimer Card */}
        <div className="bg-sage/40 rounded-2xl p-8 border border-sage-muted space-y-3">
          <div className="flex items-center gap-2 text-sage-dark font-serif text-lg font-medium">
            <ShieldCheck className="w-5 h-5 text-sage-dark" />
            <span>Responsible Wellness & Clinical Boundaries</span>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Auro Perfect Vision provides educational vision wellness, eye yoga, and complementary ocular relaxation therapies. We do not claim to replace licensed medical ophthalmological surgery, medical prescriptions, or emergency disease diagnosis. We encourage all participants to maintain routine clinical examinations with their certified eye care specialists.
          </p>
        </div>

        {/* Call to action */}
        <div className="text-center pt-8 space-y-4">
          <h3 className="font-serif text-2xl text-ink">
            Experience our mindful approach in person or online.
          </h3>
          <div className="flex justify-center gap-4">
            <Link href="/therapies">
              <Button variant="primary" size="lg" className="gap-2">
                <span>View Therapies & Book</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
