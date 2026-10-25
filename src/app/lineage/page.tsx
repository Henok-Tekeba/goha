import type { Metadata } from "next";
import { buildLineageDescription } from "@/features/ecosystem/lib/lineage-copy";
import {
  getPublicLineage,
  getPublicStats,
} from "@/features/ecosystem/lib/public-data.server";
import LineageView from "@/features/ecosystem/views/lineage.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export function generateMetadata(): Metadata {
  const lineage = getPublicLineage();
  const stats = getPublicStats();

  return {
    title: "Model lineage — the family tree of Ethiopian AI",
    description: buildLineageDescription(
      lineage.stats.models,
      stats.counts.models
    ),
    alternates: { canonical: "/lineage" },
  };
}

export default function LineagePage() {
  const lineage = getPublicLineage();
  const stats = getPublicStats();

  return (
    <>
      <main>
        <LineageView
          stats={lineage.stats}
          totalModels={stats.counts.models}
          lineage={lineage}
        />
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
