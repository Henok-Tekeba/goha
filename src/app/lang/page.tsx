import type { Metadata } from "next";
import Link from "next/link";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { getLanguagePage, languages } from "@/shared/lib/local-data.server";

export const metadata: Metadata = {
  title: "Languages — Ethiopian AI by language · goha.et",
  description:
    "Coverage maps and gap analysis for Amharic, Afaan Oromo, Tigrinya, Ge'ez and more — what exists, and what's still missing.",
  alternates: { canonical: "/lang" },
};

export default function LanguagesIndexPage() {
  const rows = languages
    .map((language) => {
      const page = getLanguagePage(language.slug);
      return page
        ? {
            ...language,
            models: page.models.length,
            datasets: page.datasets.length,
            papers: page.papers.length,
          }
        : { ...language, models: 0, datasets: 0, papers: 0 };
    })
    .filter((row) => row.models + row.datasets + row.papers > 0);

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
              and the gaps that are still open. The honest picture of where
              Ethiopian AI stands.
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
