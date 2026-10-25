import type { Metadata } from "next";
import { getPublicActivityPayload } from "@/features/ecosystem/lib/public-data.server";
import ActivityView from "@/features/ecosystem/views/activity.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { pageMetadata } from "@/shared/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Today in Ethiopian AI",
  description:
    "Recent model, dataset, paper and milestone events in the Ethiopian AI ecosystem, as the daily scrape picks them up.",
  path: "/activity",
});

export default function ActivityPage() {
  const payload = getPublicActivityPayload();
  return (
    <>
      <main>
        <ActivityView events={payload.data} builtAt={payload.builtAt} />
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
