import type { Metadata } from "next";
import { getHomepageDashboardData } from "@/features/ecosystem/lib/homepage-data.server";
import HomepageViews from "@/features/projects/views/homepage.view";
import HomepageDashboard from "@/features/projects/views/homepage-dashboard.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { pageMetadata } from "@/shared/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "goha — Find and discover the Ethiopian AI ecosystem",
  description:
    "Find models, datasets, companies, and research papers for Ethiopian languages.",
  path: "/",
});

export default async function HomePage() {
  const dashboardData = await getHomepageDashboardData();

  return (
    <>
      {/* Start the hero artwork download before the body is parsed. Without
          these, a plain <img> is only discovered once the parser reaches it
          (and Next does not emit preloads for non-next/image elements).
          Media-gated so phones and desktops never fetch the other crop. */}
      <link
        rel="preload"
        as="image"
        type="image/avif"
        href={asset("/illustrations/traveler-2882.avif")}
        imageSrcSet={`${asset("/illustrations/traveler-1441.avif")} 1441w, ${asset("/illustrations/traveler-2882.avif")} 2882w`}
        imageSizes="(max-width: 767px) 0px, (max-width: 1441px) 100vw, 1441px"
        media="(min-width: 768px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        type="image/avif"
        href={asset("/illustrations/traveler-mobile.avif")}
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <main>
        <HomepageViews dashboard={<HomepageDashboard data={dashboardData} />} />
      </main>
      <CTAFooter
        imageIllustrationMobile={asset("/illustrations/king-mobile.png")}
        imageIllustration={asset("/illustrations/king.png")}
      />
    </>
  );
}
