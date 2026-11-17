import React from "react";
import { getSiteContent } from "@/lib/server/cms";
import { ContactFormView } from "@/components/contact/contact-form-view";
import { Phone, Mail, MapPin, Clock, MessageCircle, ShieldCheck, Sparkles, Navigation } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us | Auro Perfect Vision — Auroville",
  description: "Get in touch with Auro Perfect Vision in Auroville. Phone, email, WhatsApp, and visitor location.",
};

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
    <div className="bg-[#FAF9FC] min-h-screen pb-24">
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header */}
      <section className="pt-20 pb-16 bg-white border-b border-brand-gray/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-lavender text-brand-purple text-xs font-inter font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
            <span>Auroville Centre for Vision Beyond Glasses</span>
          </div>
          <h1 className="font-sora text-4xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight">
            Connect with Our <span className="text-brand-purple">Vision Educators</span>
          </h1>
          <p className="font-inter text-base text-brand-secondary max-w-xl mx-auto leading-relaxed">
            Have questions about our therapies, retreat schedules, or natural vision recovery? We are here to guide your ocular wellness journey.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Centre Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-inter font-bold uppercase tracking-wider text-brand-orange">
                Visiting & Inquiries
              </span>
              <h2 className="font-sora text-2xl sm:text-3xl font-bold text-brand-charcoal">
                Direct Contact Information
              </h2>
              <p className="font-inter text-sm text-brand-secondary leading-relaxed">
                Reach us during centre operating hours or drop a message anytime. For urgent booking consultations, our WhatsApp desk is monitored daily.
              </p>
            </div>

            {/* Quick Action Channels */}
            <div className="space-y-4 pt-2">
              {/* Phone card */}
              <div className="p-5 bg-white rounded-3xl border border-brand-gray/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-bold text-brand-charcoal">Telephone Desk</h3>
                  <div className="space-y-0.5 mt-1">
                    <a
                      href={`tel:${phonePrimary.replace(/[^0-9+]/g, "")}`}
                      className="text-xs font-sora font-semibold text-brand-purple hover:underline block"
                    >
                      {phonePrimary}
                    </a>
                    <a
                      href={`tel:${phoneSecondary.replace(/[^0-9+]/g, "")}`}
                      className="text-xs font-sora text-brand-secondary hover:text-brand-purple hover:underline block"
                    >
                      {phoneSecondary}
                    </a>
                  </div>
                  <span className="text-[11px] font-inter text-brand-secondary mt-1 block">Mon–Sat 9:00 AM – 5:30 PM IST</span>
                </div>
              </div>

              {/* Email card */}
              <div className="p-5 bg-white rounded-3xl border border-brand-gray/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-bold text-brand-charcoal">Electronic Mail</h3>
                  <a
                    href={`mailto:${email}`}
                    className="text-xs font-sora font-semibold text-brand-purple hover:underline block mt-1 break-all"
                  >
                    {email}
                  </a>
                  <span className="text-[11px] font-inter text-brand-secondary mt-1 block">Average reply within 24 hours</span>
                </div>
              </div>

              {/* WhatsApp card */}
              <div className="p-5 bg-white rounded-3xl border border-brand-gray/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-bold text-brand-charcoal">WhatsApp Direct</h3>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-emerald-700 hover:underline mt-1"
                  >
                    <span>Message Centre Desk</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-inter font-semibold">Quick Reply</span>
                  </a>
                  <span className="text-[11px] font-inter text-brand-secondary mt-1 block">Consultation queries & retreat assistance</span>
                </div>
              </div>

              {/* Location & Hours card */}
              <div className="p-5 bg-white rounded-3xl border border-brand-gray/80 shadow-sm flex items-start gap-4 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-2xl bg-brand-lavender text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-sora text-sm font-bold text-brand-charcoal">Physical Centre Location</h3>
                  <p className="font-inter text-xs text-brand-secondary mt-1 leading-relaxed">
                    {address}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-inter text-brand-charcoal font-medium">
                    <Clock className="w-3.5 h-3.5 text-brand-purple" />
                    <span>{hours}</span>
                  </div>
                  <div className="pt-3">
                    <a
                      href="https://maps.google.com/?q=Auroville+Centre+for+Vision+Beyond+Glasses"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-sora font-bold text-brand-purple hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-4 rounded-2xl bg-white border border-brand-gray/80 text-xs font-inter text-brand-secondary flex items-start gap-3 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-brand-purple shrink-0 mt-0.5" />
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
