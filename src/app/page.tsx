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
