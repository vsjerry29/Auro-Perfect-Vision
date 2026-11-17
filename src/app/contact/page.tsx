import React from "react";
import { getSiteContent } from "@/lib/server/cms";
import { ContactFormView } from "@/components/contact/contact-form-view";
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck, Sparkles, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  const siteContent = getSiteContent();

  const phonePrimary = siteContent.phone || "+91 8012305151";
  const phoneSecondary = "+91 9488005685";
  const email = siteContent.email || "connect@auroperfectvision.com";
  const address = siteContent.address || "Auroville, Tamil Nadu 605101, India";
  const hours = siteContent.openingHours || "Monday - Saturday: 9:00 AM - 5:30 PM IST (Closed Sundays)";
  const whatsappUrl = siteContent.whatsappLink || "https://wa.me/918012305151";

  // Google LocalBusiness Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Auro Perfect Vision",
    description: "Holistic eye care, Bates method, conscious eye relaxation, and photobiomodulation centre in Auroville.",
    url: "https://auro-perfect-vision.vercel.app/contact",
    telephone: phonePrimary,
    email: email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Arka Crown Road",
      addressLocality: "Auroville",
      addressRegion: "Tamil Nadu",
      postalCode: "605101",
      addressCountry: "IN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "17:30",
      },
    ],
  };

  return (
    <div className="bg-canvas min-h-screen pb-24">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Editorial Header */}
      <section className="pt-16 pb-16 border-b border-ink-border/50 bg-canvas-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="gold" className="text-xs">
            Auroville Centre for Vision Beyond Glasses
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-normal tracking-tight">
            Connect with Our <span className="italic text-plum">Vision Educators</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Have questions about our therapies, retreat schedules, or natural vision recovery? We are here to guide your ocular wellness journey.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Centre Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold-dark font-sans">
                Visiting & Inquiries
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink font-normal">
                Direct Contact Information
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Reach us during centre operating hours or drop a message anytime. For urgent booking consultations, our WhatsApp desk is monitored daily.
              </p>
            </div>

            {/* Quick Action Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-2">
              {/* Phone card */}
              <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-subtle flex items-start gap-4 hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-full bg-plum/10 text-plum flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-ink">Telephone Desk</h3>
                  <div className="space-y-0.5 mt-1">
                    <a
                      href={`tel:${phonePrimary.replace(/[^0-9+]/g, "")}`}
                      className="text-xs text-plum font-mono hover:underline block"
                    >
                      {phonePrimary}
                    </a>
                    <a
                      href={`tel:${phoneSecondary.replace(/[^0-9+]/g, "")}`}
                      className="text-xs text-ink-muted font-mono hover:text-plum hover:underline block"
                    >
                      {phoneSecondary}
                    </a>
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">Mon–Sat 9:00 AM – 5:30 PM IST</span>
                </div>
              </div>

              {/* Email card */}
              <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-subtle flex items-start gap-4 hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-full bg-gold-soft text-gold-dark flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-ink">Electronic Mail</h3>
                  <a
                    href={`mailto:${email}`}
                    className="text-xs text-plum font-mono hover:underline block mt-1 break-all"
                  >
                    {email}
                  </a>
                  <span className="text-[10px] text-ink-muted mt-1 block">Average reply time within 24 hours</span>
                </div>
              </div>

              {/* WhatsApp card */}
              <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-subtle flex items-start gap-4 hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-ink">WhatsApp Desk</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold hover:underline mt-1"
                  >
                    <span>Message Centre Desk</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Quick Reply</span>
                  </a>
                  <span className="text-[10px] text-ink-muted mt-1 block">Consultation queries & retreat assistance</span>
                </div>
              </div>

              {/* Location & Hours card */}
              <div className="p-5 bg-white rounded-2xl border border-ink-border shadow-subtle flex items-start gap-4 hover:shadow-card transition-all">
                <div className="w-10 h-10 rounded-full bg-sage text-sage-dark flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-ink">Physical Centre Location</h3>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {address}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-ink font-medium">
                    <Clock className="w-3.5 h-3.5 text-gold-dark" />
                    <span>{hours}</span>
                  </div>
                  <div className="pt-3">
                    <a
                      href="https://maps.google.com/?q=Auroville+Centre+for+Vision+Beyond+Glasses"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-plum font-semibold hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiet notice */}
            <div className="p-4 rounded-xl bg-canvas-light border border-ink-border/60 text-[11px] text-ink-muted flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-plum shrink-0 mt-0.5" />
              <span>
                Personal vision therapy consultations require prior appointment booking. Walk-in visitors are warmly welcomed for literature and centre orientation.
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <ContactFormView />
          </div>
        </div>
      </div>
    </div>
  );
}
