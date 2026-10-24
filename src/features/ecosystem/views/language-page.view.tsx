"use client";

import Link from "next/link";

import { PaperRow } from "@/features/ecosystem/components/papers-list.component";
import ProjectGrid from "@/features/projects/components/project-grid.component";
import type { LanguagePageData } from "@/shared/lib/local-data.server";

function SectionHeading({
  title,
  count,
  href,
  hrefLabel,
}: {
  title: string;
  count: number;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2
        className="text-lg text-primary tracking-[-0.03em] md:text-xl"
        style={{ fontFamily: "Aspekta", fontWeight: 500 }}
      >
        {title}
        <span className="ml-2 align-middle text-foreground/30 text-sm tabular-nums">
          {count}
        </span>
      </h2>
      {href && count > 0 && (
        <Link
          href={href}
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          {hrefLabel ?? "See all →"}
        </Link>
      )}
    </div>
  );
}

export default function LanguagePageView({ data }: { data: LanguagePageData }) {
  const { name, glyph, models, datasets, papers, coverage, gaps } = data;

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex size-14 items-center justify-center rounded-[16px] bg-secondary text-2xl text-primary"
            style={{ fontFamily: "'Noto Sans Ethiopic', Aspekta, sans-serif" }}
            aria-hidden
          >
            {glyph}
          </span>
          <div>
            <h1
              className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              {name}
            </h1>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {models.length} model{models.length === 1 ? "" : "s"} ·{" "}
              {datasets.length} dataset{datasets.length === 1 ? "" : "s"} ·{" "}
              {papers.length} paper{papers.length === 1 ? "" : "s"} — everything
              indexed for {name}
            </p>
          </div>
        </div>
      </header>

      {/* coverage matrix */}
      <section className="mb-12" aria-label="Task coverage">
        <h2
          className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          What exists for {name}
        </h2>
        <div className="overflow-hidden rounded-[16px] border border-muted-black-stroke">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-muted-black-stroke border-b text-left text-foreground/40 text-xs">
                <th className="px-5 py-2.5 font-medium">Task</th>
                <th className="px-3 py-2.5 text-right font-medium">Models</th>
                <th className="px-3 py-2.5 text-right font-medium">Datasets</th>
                <th className="px-5 py-2.5 text-right font-medium">Papers</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((row) => {
                const total = row.models + row.datasets + row.papers;
                return (
                  <tr
                    key={row.task}
                    className={
                      total === 0 ? "bg-foreground/[0.015]" : undefined
                    }
                  >
                    <td className="px-5 py-2.5 font-medium text-primary text-sm tracking-tight">
                      {row.task}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.models > 0 ? (
                        row.models
                      ) : (
                        <span className="text-foreground/25">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {row.datasets > 0 ? (
                        row.datasets
                      ) : (
                        <span className="text-foreground/25">—</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">
                      {row.papers > 0 ? (
                        row.papers
                      ) : (
                        <span className="text-foreground/25">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* gaps */}
      {gaps.length > 0 && (
        <section className="mb-12" aria-label="Gaps">
          <h2
            className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Where the gaps are
          </h2>
          <ul className="flex flex-col gap-2">
            {gaps.map((gap) => (
              <li
                key={gap}
                className="flex items-start gap-2.5 rounded-[12px] border border-muted-black-stroke px-4 py-3 text-muted-foreground text-sm"
              >
                <span
                  aria-hidden
                  className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-destructive/70"
                />
                {gap}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* models */}
      {models.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            title={`${name} models`}
            count={models.length}
            href={`/?categories=Model&techStacks=${encodeURIComponent(name)}`}
            hrefLabel="Browse all models →"
          />
          <ProjectGrid projects={models.slice(0, 12)} />
        </section>
      )}

      {/* datasets */}
      {datasets.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            title={`${name} datasets`}
            count={datasets.length}
            href={`/?categories=Dataset&techStacks=${encodeURIComponent(name)}`}
            hrefLabel="Browse all datasets →"
          />
          <ProjectGrid projects={datasets.slice(0, 12)} />
        </section>
      )}

      {/* research */}
      {papers.length > 0 && (
        <section className="mb-12">
          <SectionHeading
            title={`${name} research`}
            count={papers.length}
            href="/research"
            hrefLabel="Open the research hub →"
          />
          <div className="flex flex-col gap-3">
            {papers.slice(0, 8).map((paper) => (
              <PaperRow key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>
      )}

      {models.length === 0 && datasets.length === 0 && papers.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Nothing indexed for {name} yet — the daily scrape may pick something
          up soon.
        </p>
      )}
    </div>
  );
}
