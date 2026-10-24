import type { Metadata } from "next";
import { Suspense } from "react";
import AskView from "@/features/ecosystem/views/ask.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Ask Goha — natural-language search for Ethiopian AI · goha",
  description:
    "Ask about Ethiopian AI in plain language: models, datasets, papers, organizations, gaps and benchmarks — answered from the index, with sources.",
  alternates: { canonical: "/ask" },
};

export default function AskPage() {
  return (
    <>
      <main>
        <Suspense>
          <AskView />
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
