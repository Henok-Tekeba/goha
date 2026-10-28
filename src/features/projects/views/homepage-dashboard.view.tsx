import Link from "next/link";

import ActivityPreview from "@/features/ecosystem/components/dashboard/activity-preview.component";
import LanguageTiles from "@/features/ecosystem/components/dashboard/language-tiles.component";
import LineageCallout from "@/features/ecosystem/components/dashboard/lineage-callout.component";
import MostUsedModels from "@/features/ecosystem/components/dashboard/most-used-models.component";
import RecentResearch from "@/features/ecosystem/components/dashboard/recent-research.component";
import EcosystemStatsBand from "@/features/ecosystem/components/ecosystem-stats-band.component";
import MoversSection from "@/features/ecosystem/components/movers-section.component";
import type { HomepageDashboardData } from "@/features/ecosystem/lib/homepage-data.server";
import ShareButton from "@/shared/components/share/share-button.component";
import { Button } from "@/shared/components/ui/button";

import DashboardHero from "../components/dashboard-hero.component";

/**
 * Landing dashboard, rendered on the server at build time. Only the hero's
 * filter bar (DashboardHero) hydrates; everything below is static HTML.
 */
export default function HomepageDashboard({
  data,
}: {
  data: HomepageDashboardData;
}) {
  return (
    <>
      <div className="flex flex-col items-center">
        <DashboardHero />
        <EcosystemStatsBand stats={data.stats} />
      </div>
      <div className="mx-6 mb-20 max-w-6xl md:mb-36 lg:mx-auto">
        <div className="flex flex-col gap-16 md:gap-20">
          <MoversSection movers={data.movers} />
          <LineageCallout />
          <MostUsedModels models={data.models} totalModels={data.totalModels} />
          <RecentResearch papers={data.papers} />
          <LanguageTiles languages={data.languages} />
          <ActivityPreview events={data.activity} />
          <section
            aria-labelledby="contribute-heading"
            className="flex flex-col gap-4 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2
                id="contribute-heading"
                className="text-[15px] text-primary tracking-[-0.01em]"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Missing something?
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm">
                <Link href="/contribute">Submit a data point</Link>
              </Button>
              <ShareButton
                path="/"
                title="goha — An open index of Ethiopian AI"
                text="An open index of Ethiopian AI — models, datasets and research in one place."
                label="Share"
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
