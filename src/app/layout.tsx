import type { Metadata } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Auro Perfect Vision (APV) — Centre for Integral Vision Care • Pondicherry",
  description:
    "Comprehensive eye care, personalised vision therapy, myopia management, specialty contact lenses and holistic eye wellness at Auro Perfect Vision (APV), Pondicherry.",
  keywords: [
    "Auro Perfect Vision",
    "APV Pondicherry",
    "Centre for Integral Vision Care",
    "vision therapy Pondicherry",
    "eye care White Town Puducherry",
    "myopia management",
    "specialty contact lenses",
    "holistic eye wellness",
  ],
  openGraph: {
    title: "Auro Perfect Vision (APV) — Centre for Integral Vision Care",
    description:
      "Experience comprehensive eye care, personalised vision therapy, myopia management, specialty contact lenses and holistic eye wellness at Auro Perfect Vision (APV), Pondicherry.",
    url: "https://auroperfectvision.com",
    siteName: "Auro Perfect Vision (APV)",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-brand-dark antialiased font-sans">
        <DemoStoreProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </DemoStoreProvider>
      </body>
    </html>
  );
}
