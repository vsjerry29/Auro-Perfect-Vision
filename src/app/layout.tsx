import type { Metadata } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/lib/store";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Auro Perfect Vision — Centre for Vision Beyond Glasses",
  description:
    "Holistic natural eye care, Eye Yoga, screen strain recovery, and guided retreats in Auroville. Conscious visual relaxation for children and adults worldwide.",
  keywords: [
    "Auro Perfect Vision",
    "Auroville eye care",
    "Eye Yoga",
    "natural vision therapy",
    "Bates method",
    "screen eye fatigue relief",
    "Auroville holistic health",
  ],
  openGraph: {
    title: "Auro Perfect Vision — Centre for Vision Beyond Glasses",
    description:
      "A more mindful approach to natural vision. Holistic ocular wellness and eye yoga rooted in the intentional township of Auroville.",
    url: "https://auroperfectvision.com",
    siteName: "Auro Perfect Vision",
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
