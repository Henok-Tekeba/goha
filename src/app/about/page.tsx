import type { Metadata } from "next";
import Link from "next/link";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "About — the home of Ethiopian AI",
  description:
    "Why goha exists, how the index is built, what it covers and what it deliberately does not do.",
  alternates: { canonical: "/about" },
};

const STEPS = [
  {
    title: "Scrape the public record",
    body: "Every day, goha queries Hugging Face, GitHub and arXiv for models, datasets, spaces, repositories and papers across Amharic, Afaan Oromo, Tigrinya, Ge'ez and more.",
  },
  {
    title: "Normalize into one contract",
    body: "Directory entities — models, datasets, companies and papers — share one Project contract: title, owner, task, languages, downloads, license, model card and evaluations. Ecosystem surfaces such as orgs, the leaderboard and the family tree have their own JSON shapes.",
  },
  {
    title: "Derive the ecosystem surfaces",
    body: "Activity feed, movers, organization footprints, research tags, leaderboards, language coverage, growth history and the family tree are all computed from the same scrape.",
  },
  {
    title: "Export a static site",
    body: "The build emits plain JSON and HTML. The exported site has no database, server or API keys. The daily scrape workflow itself uses Hugging Face and GitHub tokens, stored as repository secrets.",
  },
];

const PRINCIPLES = [
  {
    title: "Every table row cites its source",
    body: "Benchmark rows link to the model card they came from. Aggregate counts link to their methodology; no number is invented to look complete.",
  },
  {
    title: "Amharic is not decoration",
    body: "Languages, scripts and local names are first-class data — coverage and gaps are reported per language, not as an aggregate.",
  },
  {
    title: "The scraper is the product",
    body: "The interface is a surface over the pipeline. If a number is wrong here, the fix belongs in the scrape, not in a hardcoded label.",
  },
  {
    title: "No LLM required",
    body: "Ask Goha answers from structured data with a deterministic parser. Its 48-query evaluation measures parser field accuracy, not answer correctness — the limitation is documented on the Ask page.",
  },
];

export default function AboutPage() {
  return (
    <>
      <main>
        <div className="mx-auto max-w-3xl px-6">
          <header className="mb-12">
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-[0.08em]">
              About
            </p>
            <h1
              className="text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              An index built in the open
            </h1>
            <p className="mt-5 text-muted-foreground text-sm leading-relaxed">
              goha (ጎሃ) exists because the Ethiopian AI ecosystem was visible
              everywhere and legible nowhere. Models were scattered across
              Hugging Face, datasets across GitHub, research across arXiv — and
              nobody could answer a simple question:{" "}
              <span className="text-primary">
                what exists for Amharic, Afaan Oromo, Tigrinya and Ge'ez, and
                what is missing?
              </span>
            </p>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              This site is that answer, rebuilt every day: a live index of
              models, datasets, research, organizations and benchmarks — with
              the gaps stated as plainly as the wins.
            </p>
          </header>

          <section className="mb-12" aria-labelledby="how-heading">
            <h2
              id="how-heading"
              className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              How it works
            </h2>
            <ol className="flex flex-col gap-2">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-[14px] border border-muted-black-stroke bg-white px-4 py-3.5"
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] text-muted-foreground tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-primary text-sm tracking-tight">
                      {step.title}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12" aria-labelledby="principles-heading">
            <h2
              id="principles-heading"
              className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Principles
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-[14px] border border-muted-black-stroke bg-white px-4 py-3.5"
                >
                  <p className="font-medium text-primary text-sm tracking-tight">
                    {principle.title}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {principle.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12" aria-labelledby="limits-heading">
            <h2
              id="limits-heading"
              className="mb-3 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              What it deliberately does not do
            </h2>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground text-xs leading-relaxed">
              <li>
                It does not host or run models — every link goes to the source
                (Hugging Face, GitHub, arXiv).
              </li>
              <li>
                It does not claim completeness: the index only knows what is
                published with discoverable metadata.
              </li>
              <li>
                It does not rank by opinion — leaderboards only aggregate
                numbers the authors published.
              </li>
              <li>
                It does not generate text — Ask Goha composes answers from the
                same structured data you can read in{" "}
                <Link
                  href="/api"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  the open data
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="mb-12 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-4">
            <h2 className="font-medium text-primary text-sm tracking-tight">
              Who built this
            </h2>
            <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
              goha is built by{" "}
              <a
                href="https://github.com/Henok-Tekeba"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Henok Tekeba
              </a>{" "}
              — a student who wanted this index to exist, so he built it. The
              scraper, the data pipeline and the ecosystem surfaces are original
              work; the interface is adapted from{" "}
              <a
                href="https://opensource-together.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                OpenSource Together
              </a>{" "}
              (CC BY-NC 4.0).
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Source and daily snapshots:{" "}
              <a
                href="https://github.com/Henok-Tekeba/goha"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                github.com/Henok-Tekeba/goha
              </a>{" "}
              · Data and pipeline:{" "}
              <a
                href="https://github.com/Henok-Tekeba/goha/blob/main/LICENSE-MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-primary"
              >
                MIT
              </a>{" "}
              · UI: CC BY-NC 4.0
            </p>
          </section>

          <section className="mb-16">
            <p className="text-muted-foreground text-xs">
              Explore:{" "}
              <Link href="/lineage" className="underline underline-offset-4">
                lineage
              </Link>{" "}
              ·{" "}
              <Link
                href="/leaderboard"
                className="underline underline-offset-4"
              >
                benchmarks
              </Link>{" "}
              ·{" "}
              <Link href="/gaps" className="underline underline-offset-4">
                gaps
              </Link>{" "}
              ·{" "}
              <Link href="/ask" className="underline underline-offset-4">
                ask
              </Link>{" "}
              ·{" "}
              <Link href="/api" className="underline underline-offset-4">
                open data
              </Link>
            </p>
          </section>
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
