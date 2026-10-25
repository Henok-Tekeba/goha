import type { Metadata } from "next";
import Link from "next/link";
import LanguageRadarChart from "@/features/ecosystem/components/charts/language-radar-chart";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import {
  getLanguageCoverageSummary,
  getLanguagePage,
  languages,
} from "@/shared/lib/local-data.server";

export const metadata: Metadata = {
  title: "Languages — Ethiopian AI by language",
  description:
    "Coverage maps and gap analysis for Amharic, Afaan Oromo, Tigrinya, Ge'ez, Somali, Wolayttattoo, Sidaamu Afoo and English — what exists, and what's still missing.",
  alternates: { canonical: "/lang" },
};

export default function LanguagesIndexPage() {
  const summary = getLanguageCoverageSummary();
  const rows = languages.map((language) => {
    const page = getLanguagePage(language.slug);
    return page
      ? {
          ...language,
          models: page.models.length,
          datasets: page.datasets.length,
          papers: page.papers.length,
        }
      : { ...language, models: 0, datasets: 0, papers: 0 };
  });

  return (
    <>
      <main>
        <div className="mx-auto max-w-4xl px-6">
          <header className="mb-8">
            <h1
              className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Languages
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Each language gets a coverage map — models, datasets, research —
              and the gaps that are still open. Counts cover models and datasets
              whose language metadata or name declares the language, plus papers
              whose derived language tags match; items tagged with more than one
              language appear under each language. {summary.untaggedAssets}{" "}
              assets and {summary.untaggedPapers} papers have no recognized
              language tag and are not counted here.
            </p>
          </header>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rows.map((row) => (
              <Link
                key={row.slug}
                href={`/lang/${row.slug}`}
                className="group flex items-center gap-4 rounded-[16px] border border-muted-black-stroke px-5 py-4 transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgb(0_0_0/0.05)]"
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-secondary text-primary text-xl"
                  style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
                  aria-hidden
                >
                  {row.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary text-sm tracking-tight">
                    {row.name}
                  </p>
                  <p className="mt-0.5 text-muted-foreground text-xs tabular-nums">
                    {row.models} models · {row.datasets} datasets · {row.papers}{" "}
                    papers
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-12" aria-label="Coverage comparison">
            <h2
              className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              The gaps, side by side
            </h2>
            <p className="mb-4 max-w-2xl text-muted-foreground text-xs leading-relaxed">
              Coverage across the six tracked tasks for every language in the
              index — models plus datasets, counted from the same language
              records as the cards above. Click a language to isolate it; the
              missing axes are the open problems in Ethiopian AI.
            </p>
            <LanguageRadarChart className="h-[420px] w-full md:h-[480px]" />
            <p className="mt-4 text-muted-foreground text-xs">
              <Link
                href="/gaps"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Read the full gap report →
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
