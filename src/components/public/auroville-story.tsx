import React from "react";
import Link from "next/link";
import { ArrowRight, Trees, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AurovilleStory() {
  return (
    <section className="py-20 lg:py-28 bg-canvas border-b border-ink-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image Duo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-card border-4 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80"
                alt="Tranquil natural surroundings of Auroville"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden shadow-elevated border-4 border-white hidden sm:block">
              <img
                src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80"
                alt="Peaceful visual meditation practice"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column: Editorial Narrative */}
          <div className="lg:col-span-7 space-y-6 lg:pl-6">
            <div className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-gold-dark">
              <Trees className="w-4 h-4 text-sage-dark" />
              <span>Conscious Township Heritage</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight leading-tight">
              Rooted in the spirit of Auroville: <br />
              <span className="italic text-plum">Holistic growth, wellness & inner balance.</span>
            </h2>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              Auroville was conceived as an international city dedicated to human unity, sustainable ecology, and integral education. For decades, natural vision educators within the community have researched non-pharmaceutical eye care practices, cultivating deep awareness of the link between ocular fatigue, breathing patterns, and mental stress.
            </p>

            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              At Auro Perfect Vision, our centre operates as a peaceful sanctuary away from urban glare. Here, nature, organic architecture, and conscious attention combine to give your sight the quiet respite it needs.
            </p>

            <div className="pt-2">
              <Link href="/about">
                <Button variant="primary" size="md" className="gap-2">
                  <span>Discover Our Auroville Roots</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
