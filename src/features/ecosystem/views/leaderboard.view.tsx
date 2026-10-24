"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { HiArrowTopRightOnSquare, HiCheck } from "react-icons/hi2";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import { useLeaderboardQuery } from "../hooks/ecosystem.queries";
import type {
  LeaderboardRow,
  LeaderboardSection,
} from "../types/ecosystem.types";

function csvEscape(value: string | number | null): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(section: LeaderboardSection) {
  const header = [
    "rank",
    "model",
    "org",
    "languages",
    "dataset",
    "metric",
    "value",
    "verified",
    "downloads",
    "source",
  ];
  const lines = section.rows.map((row, i) =>
    [
      i + 1,
      row.model,
      row.org,
      row.languages.join(";"),
      row.dataset,
      row.metric,
      row.display,
      row.verified ? "yes" : "no",
      row.downloads,
      row.source,
    ]
      .map(csvEscape)
      .join(",")
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `goha-leaderboard-${section.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionTable({ section }: { section: LeaderboardSection }) {
  const [language, setLanguage] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      language
        ? section.rows.filter((r) => r.languages.includes(language))
        : section.rows,
    [section, language]
  );

  return (
    <section
      className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5"
      aria-labelledby={`lb-${section.id}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          id={`lb-${section.id}`}
          className="text-base text-primary tracking-[-0.02em] md:text-lg"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          {section.name}
        </h2>
        <div className="flex items-center gap-2">
          {section.languages.length > 1 && (
            <div className="flex flex-wrap items-center gap-1">
              {section.languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(language === lang ? null : lang)}
                  aria-pressed={language === lang}
                  className={cn(
                    "rounded-full border border-muted-black-stroke px-2 py-0.5 text-[11px] transition-colors",
                    language === lang
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => exportCsv(section)}
            className="rounded-full border border-muted-black-stroke px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            Export CSV
          </button>
        </div>
      </div>
      <p className="mt-1 text-muted-foreground text-xs">
        {section.lowerIsBetter ? "Lower is better ·" : "Higher is better ·"}{" "}
        {rows.length} entr{rows.length === 1 ? "y" : "ies"} — as published by
        the model authors
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-muted-black-stroke border-b text-left text-black/40 text-xs">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Model</th>
              <th className="py-2 pr-3 font-medium">Language</th>
              <th className="hidden py-2 pr-3 font-medium md:table-cell">
                Dataset
              </th>
              <th className="py-2 pr-3 text-right font-medium">Result</th>
              <th className="hidden py-2 pr-3 text-right font-medium sm:table-cell">
                Downloads
              </th>
              <th className="py-2 text-right font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <LeaderboardRowView
                key={`${row.model}-${i}`}
                row={row}
                rank={i + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LeaderboardRowView({
  row,
  rank,
}: {
  row: LeaderboardRow;
  rank: number;
}) {
  const external = !row.projectId;
  const modelHref = row.projectId
    ? `/projects/${row.projectId}`
    : (row.source ?? "#");
  return (
    <tr className="border-muted-black-stroke border-b last:border-b-0">
      <td className="py-2.5 pr-3 text-black/40 text-xs tabular-nums">{rank}</td>
      <td className="max-w-[220px] py-2.5 pr-3">
        <Link
          href={modelHref}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="block truncate font-medium text-primary text-sm tracking-tight hover:underline hover:decoration-black/20"
          title={row.model}
        >
          {row.model}
        </Link>
        <span className="block truncate text-muted-foreground text-xs">
          {row.org}
        </span>
      </td>
      <td className="py-2.5 pr-3 text-muted-foreground text-xs">
        {row.languages.slice(0, 2).join(", ") || "—"}
      </td>
      <td className="hidden max-w-[200px] py-2.5 pr-3 md:table-cell">
        <span
          className="block truncate text-muted-foreground text-xs"
          title={row.dataset ?? ""}
        >
          {row.dataset ?? "—"}
        </span>
      </td>
      <td className="whitespace-nowrap py-2.5 pr-3 text-right">
        <span className="font-medium text-primary text-sm tabular-nums">
          {row.display}
        </span>
        {row.verified && (
          <span
            className="ml-1.5 text-black/40"
            title="Verified metric (reported by Hugging Face)"
          >
            <HiCheck className="inline size-3.5" />
          </span>
        )}
        <span className="block text-[10px] text-black/30">{row.metric}</span>
      </td>
      <td className="hidden py-2.5 pr-3 text-right text-muted-foreground text-xs tabular-nums sm:table-cell">
        <span className="inline-flex items-center gap-1">
          <FaDownload className="size-2.5" />
          {formatNumberShort(row.downloads)}
        </span>
      </td>
      <td className="py-2.5 text-right">
        {row.source ? (
          <a
            href={row.source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open source for ${row.model}`}
            className="inline-flex text-black/30 transition-colors hover:text-primary"
          >
            <HiArrowTopRightOnSquare className="size-4" />
          </a>
        ) : null}
      </td>
    </tr>
  );
}

export default function LeaderboardView() {
  const { data, isLoading, isError } = useLeaderboardQuery();

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Benchmarks & rankings
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          How Ethiopian-language models compare on the numbers their authors
          published — ASR word error rates, retrieval accuracy, OCR and more.
          goha only normalizes formats; every row cites its source on Hugging
          Face. New results appear as the daily scrape picks them up.
        </p>
        {data?.builtAt && (
          <p className="mt-2 text-black/40 text-xs">
            Table built {new Date(data.builtAt).toISOString().slice(0, 10)}
          </p>
        )}
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-muted-black-stroke p-6"
            >
              <Skeleton className="h-6 w-48" />
              <div className="mt-4 flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : isError || !data || data.sections.length === 0 ? (
        <EmptyState
          title="No published results yet"
          description="Once models publish evaluation tables, they rank here."
          className="my-16"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {data.sections.map((section) => (
            <SectionTable key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
