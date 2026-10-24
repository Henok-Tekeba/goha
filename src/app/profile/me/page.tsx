import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileView from "@/features/profile/views/profile.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "My Profile",
  description: "My profile on goha.et",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <>
      <Suspense fallback={null}>
        <ProfileView />
      </Suspense>
      <CTAFooter
        imageIllustration={asset("/illustrations/footer-profile-desktop.png")}
        imageIllustrationMobile={asset(
          "/illustrations/footer-profile-mobile.png"
        )}
      />
    </>
  );
}
