import type { Metadata } from "next";
import {
  getPublicGrowth,
  getPublicLeaderboard,
  getPublicTopModels,
} from "@/features/ecosystem/lib/public-data.server";
import LeaderboardView from "@/features/ecosystem/views/leaderboard.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Benchmarks & rankings",
  description:
    "How Ethiopian-language models compare on published results: ASR word error rates, retrieval accuracy, OCR — every row cites its source.",
  alternates: { canonical: "/leaderboard" },
};

export default function LeaderboardPage() {
  return (
    <>
      <main>
        <LeaderboardView
          leaderboard={getPublicLeaderboard()}
          growth={getPublicGrowth()}
          topModels={getPublicTopModels()}
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
