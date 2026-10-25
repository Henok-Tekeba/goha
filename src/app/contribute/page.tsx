import type { Metadata } from "next";
import { FRONTEND_URL } from "@/config/config";
import ContributionForm from "@/features/contribute/components/contribution-form.component";
import { getPublicStats } from "@/features/ecosystem/lib/public-data.server";
import StarRepoCard from "@/shared/components/community/star-repo-card.component";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";

const CONTRIBUTE_URL = `${FRONTEND_URL.replace(/\/$/, "")}/contribute`;
const CONTRIBUTE_DESCRIPTION =
  "Submit a model, dataset, paper, organization or benchmark to goha. Corrections and feedback are welcome too — everything is reviewed and added to the open index.";

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

const steps = [
  {
    title: "Describe the data",
    detail:
      "Pick a type, add the public link and the details you already know. The form writes the issue for you.",
  },
  {
    title: "Open the GitHub issue",
    detail:
      "Your submission becomes a public issue, so the community can see it and add context.",
  },
  {
    title: "It lands in the index",
    detail:
      "Accepted entries are reviewed and added to an upcoming daily rebuild, with a link back to the source.",
  },
];

export default function ContributePage() {
  const stats = getPublicStats();

  return (
    <>
      <main>
        <div className="mx-auto max-w-5xl px-6">
          <header className="mb-10 max-w-3xl">
            <p className="mb-2 font-medium text-black/40 text-xs uppercase tracking-[0.08em]">
              Contribute
            </p>
            <h1
              className="text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Put Ethiopian AI on the map
            </h1>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              goha only knows what the community shares. If you built a model,
              published a dataset, wrote a paper or spotted something wrong,
              this page turns it into a clean GitHub issue in under a minute. No
              account on goha, no form database, no black box.
            </p>
            <p className="mt-2 text-black/40 text-xs tabular-nums">
              Currently indexing {stats.counts.models} models ·{" "}
              {stats.counts.datasets} datasets · {stats.counts.papers} papers ·{" "}
              {stats.counts.orgs} organizations
            </p>
          </header>

          <section aria-labelledby="form-heading" className="mb-12">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="form-heading"
                className="text-lg text-primary tracking-[-0.03em] md:text-xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Submit a data point
              </h2>
              <span className="text-muted-foreground text-xs">
                Model · dataset · paper · org · benchmark · correction ·
                feedback
              </span>
            </div>
            <ContributionForm />
            <p className="mt-3 text-[11px] text-black/40">
              Submissions are public GitHub issues. Don't include private or
              personal information you don't want published.
            </p>
          </section>

          <section aria-labelledby="next-heading" className="mb-12">
            <h2
              id="next-heading"
              className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              What happens next
            </h2>
            <ol className="grid gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-[16px] border border-muted-black-stroke bg-white px-4 py-4"
                >
                  <span className="font-medium text-black/30 text-xs tabular-nums">
                    0{index + 1}
                  </span>
                  <p className="mt-1 font-medium text-primary text-sm tracking-tight">
                    {step.title}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues?q=label%3Agoha-submit`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs underline underline-offset-4"
              >
                See the submission queue →
              </a>
              <a
                href={`${EXTERNAL_LINKS.GITHUB_REPO}/issues/new/choose`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground text-xs underline underline-offset-4 transition-colors hover:text-primary"
              >
                Browse all issue templates →
              </a>
            </div>
          </section>

          <section
            id="feedback"
            aria-labelledby="feedback-heading"
            className="mb-12 rounded-[18px] border border-muted-black-stroke bg-secondary/40 px-5 py-5"
          >
            <h2
              id="feedback-heading"
              className="text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Feedback is data too
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              If you are a creator, researcher or builder using goha, tell us
              what is missing. The feedback tab above opens a public issue with
              your note, and it directly shapes what gets built next. No GitHub
              account? Copy the generated submission and send it to the person
              who shared goha with you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/contribute?type=feedback#form-heading"
                className="inline-flex items-center rounded-full border border-muted-black-stroke bg-white px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:text-primary"
              >
                Open the feedback form
              </a>
              <a
                href={`${FRONTEND_URL.replace(/\/$/, "")}/creators`}
                className="inline-flex items-center rounded-full border border-muted-black-stroke bg-white px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:text-primary"
              >
                Creator kit →
              </a>
            </div>
          </section>

          <div className="mb-16 grid gap-4 md:grid-cols-2">
            <StarRepoCard />
            <div className="rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5">
              <h2
                className="text-[15px] text-primary tracking-[-0.01em]"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Prefer the open data?
              </h2>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                Every surface is backed by a static JSON file. Reuse it, remix
                it, or build your own view — attribution is appreciated.
              </p>
              <a
                href="/api"
                className="mt-4 inline-flex text-primary text-sm underline underline-offset-4"
              >
                Browse the open data →
              </a>
            </div>
          </div>
        </div>
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
