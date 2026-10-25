import type { Metadata } from "next";
import OrgsView from "@/features/ecosystem/views/orgs.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { orgs } from "@/shared/lib/local-data.server";

export const metadata: Metadata = {
  title: "Publishers — who is publishing Ethiopian AI",
  description:
    "Companies, labs and individual publishers with public models, datasets, repositories or spaces in the index, plus curated company records.",
  alternates: { canonical: "/orgs" },
};

export default function OrgsPage() {
  return (
    <>
      <main>
        <OrgsView orgs={orgs} />
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
