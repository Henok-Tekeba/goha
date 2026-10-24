import type { Metadata } from "next";
import { Suspense } from "react";
import CompareView from "@/features/ecosystem/views/compare.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Compare Ethiopian AI models — goha.et",
  description:
    "Put Ethiopian models side by side: download trajectories, task, languages, license, size and lineage.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <>
      <main>
        <Suspense>
          <CompareView />
        </Suspense>
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
