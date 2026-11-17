import React from "react";
import Link from "next/link";
import { Eye, Heart, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-canvas-light border-t border-ink-muted/30 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-ink-muted/40">
          {/* Column 1: Brand & Auroville Identity */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-plum shadow">
                <Eye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="font-serif text-xl text-canvas-light tracking-tight">
                Auro Perfect Vision
              </span>
            </div>
            <p className="text-xs text-canvas-dark/80 leading-relaxed">
              Centre for Vision Beyond Glasses. Grounded in the conscious, holistic lifestyle of Auroville, dedicating our work to natural eye relaxation, visual motor skills, and mindful screen recovery.
            </p>
            <div className="text-xs text-gold-light/90 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Auroville, Tamil Nadu 605101, India</span>
            </div>
          </div>

          {/* Column 2: Public Navigation */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-gold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-canvas-dark/90">
              <li>
                <Link href="/about" className="hover:text-gold-light transition-colors">
                  Our Mission & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/therapies" className="hover:text-gold-light transition-colors">
                  Therapies & Flagship Programmes
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-gold-light transition-colors">
                  Meet the Practitioners
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-gold-light transition-colors">
                  Eye Wellness Journal
                </Link>
              </li>
              <li>
                <Link href="/therapies" className="hover:text-gold-light transition-colors">
                  Book a Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Verified Offerings */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-gold mb-4">
              Core Offerings
            </h4>
            <ul className="space-y-2.5 text-xs text-canvas-dark/90">
              <li>
                <Link href="/therapies/eye-yoga" className="hover:text-gold-light transition-colors">
                  Eye Yoga (Children & Adults)
                </Link>
              </li>
              <li>
                <Link href="/therapies/vision-stress-relief" className="hover:text-gold-light transition-colors">
                  Vision Stress Relief Therapy
                </Link>
              </li>
              <li>
                <Link href="/therapies/customized-vision-therapy" className="hover:text-gold-light transition-colors">
                  Customized Vision Therapy
                </Link>
              </li>
              <li>
                <Link href="/therapies/visual-skill-enhancement" className="hover:text-gold-light transition-colors">
                  Visual Skill Enhancement
                </Link>
              </li>
              <li>
                <Link href="/therapies/retreat-holistic-vision-awakening" className="hover:text-gold-light transition-colors">
                  7-Day Vision Awakening Retreat
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Operational Portal & Legal Disclaimer */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-gold mb-4">
              Staff Portals
            </h4>
            <div className="flex flex-col gap-2 mb-5">
              <Link
                href="/admin"
                className="inline-flex items-center justify-between text-xs bg-ink-muted/30 hover:bg-ink-muted/50 text-canvas-light px-3 py-2 rounded-lg transition-colors border border-ink-muted/40"
              >
                <span>Admin Management Console</span>
                <ExternalLink className="w-3.5 h-3.5 text-gold" />
              </Link>
              <Link
                href="/therapist"
                className="inline-flex items-center justify-between text-xs bg-ink-muted/30 hover:bg-ink-muted/50 text-canvas-light px-3 py-2 rounded-lg transition-colors border border-ink-muted/40"
              >
                <span>Therapist Portal & Schedule</span>
                <ExternalLink className="w-3.5 h-3.5 text-gold" />
              </Link>
            </div>
            <p className="text-[11px] text-canvas-dark/60 leading-normal">
              Educational & Complementary Notice: Natural vision exercises and eye yoga are designed for relaxation and visual hygiene. They are not a replacement for ophthalmological medical diagnosis or surgical care.
            </p>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-canvas-dark/60 gap-4">
          <p>© {new Date().getFullYear()} Auro Perfect Vision. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for conscious living in Auroville <Heart className="w-3 h-3 text-gold fill-gold inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
