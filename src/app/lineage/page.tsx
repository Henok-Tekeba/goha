import type { Metadata } from "next";
import {
  getPublicLineage,
  getPublicStats,
} from "@/features/ecosystem/lib/public-data.server";
import LineageView from "@/features/ecosystem/views/lineage.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Model lineage — the family tree of Ethiopian AI",
  description:
    "Every Ethiopian model traces back to a foundation model. Explore the genealogy of Llama, Whisper, w2v-BERT and BERT descendants across the ecosystem.",
  alternates: { canonical: "/lineage" },
};

export default function LineagePage() {
  const lineage = getPublicLineage();
  const stats = getPublicStats();

  return (
    <>
      <main>
        <LineageView stats={lineage.stats} totalModels={stats.counts.models} />
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
