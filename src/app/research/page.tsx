import type { Metadata } from "next";
import ResearchView from "@/features/ecosystem/views/research.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Research — papers on Ethiopian languages",
  description:
    "Published research on Amharic, Afaan Oromo, Tigrinya and Ge'ez — ASR, translation, LLMs and benchmarks, swept from arXiv daily.",
  alternates: { canonical: "/research" },
};

export default function ResearchPage() {
  return (
    <>
      <main>
        <ResearchView />
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
