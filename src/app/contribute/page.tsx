import type { Metadata } from "next";

import { FRONTEND_URL } from "@/config/config";
import ContributionForm from "@/features/contribute/components/contribution-form.component";
import { getPublicStats } from "@/features/ecosystem/lib/public-data.server";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";

const CONTRIBUTE_URL = `${FRONTEND_URL.replace(/\/$/, "")}/contribute`;
const CONTRIBUTE_DESCRIPTION =
  "Submit a model, dataset, paper, organization or benchmark to goha. Corrections and feedback are welcome too — every issue is reviewed manually before anything is indexed.";

export const metadata: Metadata = {
  title: "Contribute data — put Ethiopian AI on the map",
  description: CONTRIBUTE_DESCRIPTION,
  alternates: { canonical: CONTRIBUTE_URL },
  openGraph: {
    title: "Contribute data — put Ethiopian AI on the map",
    description: CONTRIBUTE_DESCRIPTION,
    url: CONTRIBUTE_URL,
    siteName: "goha",
    type: "website",
    images: [
      {
        url: `${FRONTEND_URL.replace(/\/$/, "")}/og.png`,
        width: 1200,
        height: 630,
        alt: "goha — Contribute data",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute data — put Ethiopian AI on the map",
    description: CONTRIBUTE_DESCRIPTION,
    images: [`${FRONTEND_URL.replace(/\/$/, "")}/og.png`],
  },
};

export default function ContributePage() {
  const stats = getPublicStats();
  const snapshot = new Date(stats.indexedAt).toISOString().slice(0, 10);
  return (
    <main>
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-10 max-w-xl">
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-[0.08em]">
            Contribute
          </p>
          <h1
            className="text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Submit a data point
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Model, dataset, paper, organization, benchmark, correction or
            feedback. It opens a GitHub issue in under a minute.
          </p>
          <p className="mt-3 max-w-xl text-primary text-sm leading-relaxed">
            Every entry helps the next builder find what already exists — and
            helps Ethiopian AI get the visibility it deserves.
          </p>
        </header>

        <div id="contribute-form" className="scroll-mt-28">
          <ContributionForm />
        </div>

        <p className="mt-4 text-[13px] text-muted-foreground">
          Public GitHub issue · manually reviewed by a maintainer · indexed only
          after review. There is no automatic ingestion pipeline yet. Current
          index snapshot: {snapshot}.
        </p>

        <div className="my-16 flex flex-wrap gap-x-6 gap-y-3 border-muted-black-stroke border-t pt-6 text-sm">
          <a
            href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues?q=label%3Agoha-submit`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Submission queue (models, datasets, papers, orgs) →
          </a>
          <a
            href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues?q=label%3Agoha-benchmark`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Benchmark queue →
          </a>
          <a
            href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues?q=label%3Agoha-correction`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Corrections queue →
          </a>
          <a
            href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues?q=label%3Afeedback`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Feedback queue →
          </a>
          <a
            href={EXTERNAL_LINKS.GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Star the repo →
          </a>
        </div>
      </div>
    </main>
  );
}
