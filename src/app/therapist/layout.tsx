import React from "react";
import { TherapistNav } from "@/components/therapist/therapist-nav";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col lg:flex-row font-sans">
      <TherapistNav />
      <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
