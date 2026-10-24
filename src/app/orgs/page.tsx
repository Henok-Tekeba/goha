import type { Metadata } from "next";
import OrgsView from "@/features/ecosystem/views/orgs.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Organizations — who is building Ethiopian AI · goha",
  description:
    "Companies, labs and independent researchers building Ethiopian AI, with their full public footprint across Hugging Face and GitHub.",
  alternates: { canonical: "/orgs" },
};

export default function OrgsPage() {
  return (
    <>
      <main>
        <OrgsView />
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
