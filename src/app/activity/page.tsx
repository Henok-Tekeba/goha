import type { Metadata } from "next";
import ActivityView from "@/features/ecosystem/views/activity.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Today in Ethiopian AI",
  description:
    "Recent model, dataset, paper and milestone events in the Ethiopian AI ecosystem, as the daily scrape picks them up.",
  alternates: { canonical: "/activity" },
};

export default function ActivityPage() {
  return (
    <>
      <main>
        <ActivityView />
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
