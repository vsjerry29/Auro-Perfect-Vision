import React from "react";
import { getAllOfferings } from "@/lib/server/cms";
import { TherapiesCatalogueView } from "@/components/therapies/therapies-catalogue-view";

export const dynamic = "force-dynamic";

export default function TherapiesCataloguePage() {
  const publishedOfferings = getAllOfferings(false); // strictly published only

  return <TherapiesCatalogueView initialOfferings={publishedOfferings} />;
}
