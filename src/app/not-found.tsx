import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-canvas">
      <div className="w-14 h-14 rounded-full bg-plum/10 text-plum flex items-center justify-center mb-4">
        <Eye className="w-7 h-7 stroke-[2]" />
      </div>
      <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-ink-muted max-w-md mx-auto mb-6">
        The page you are looking for may have been relocated or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button variant="primary" size="md" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Button>
      </Link>
    </div>
  );
}
