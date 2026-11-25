import React from "react";
import { getEffectiveOfferings } from "@/lib/server/cms";
import { TherapiesCatalogueView } from "@/components/therapies/therapies-catalogue-view";

export const dynamic = "force-dynamic";

export default async function TherapiesCataloguePage() {
  const publishedOfferings = await getEffectiveOfferings(false); // strictly published only

  return <TherapiesCatalogueView initialOfferings={publishedOfferings} />;
}
