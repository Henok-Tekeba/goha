"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { HiArrowTopRightOnSquare, HiCheck } from "react-icons/hi2";
import ShareButton from "@/shared/components/share/share-button.component";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import EcosystemGrowthChart from "../components/charts/ecosystem-growth-chart";
import TopModelsChart from "../components/charts/top-models-chart";
import WerBarChart from "../components/charts/wer-bar-chart";
import { useLeaderboardQuery } from "../hooks/ecosystem.queries";
import {
  groupLeaderboardSections,
  type LeaderboardGroup,
} from "../lib/leaderboard-groups";
import type { LeaderboardRow } from "../types/ecosystem.types";

function csvEscape(value: string | number | null): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(group: LeaderboardGroup) {
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
  const lines = group.rows.map((row, i) =>
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
  a.download = `goha-leaderboard-${group.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionTable({ group }: { group: LeaderboardGroup }) {
  const [language, setLanguage] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      language
        ? group.rows.filter((r) => r.languages.includes(language))
        : group.rows,
    [group, language]
  );

  return (
    <section
      className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5"
      aria-labelledby={`lb-${group.id}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2
          id={`lb-${group.id}`}
          className="text-base text-primary tracking-[-0.02em] md:text-lg"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          {group.label}
        </h2>
        <div className="flex items-center gap-2">
          {group.languages.length > 1 && (
            <div className="flex flex-wrap items-center gap-1">
              {group.languages.map((lang) => (
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
            onClick={() => exportCsv(group)}
            className="rounded-full border border-muted-black-stroke px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            Export CSV
          </button>
        </div>
      </div>
      <p className="mt-1 text-muted-foreground text-xs">
        {group.lowerIsBetter ? "Lower is better ·" : "Higher is better ·"}{" "}
        {rows.length} entr{rows.length === 1 ? "y" : "ies"} — as published by
        the model authors
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-muted-black-stroke border-b text-left text-muted-foreground text-xs">
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
      <td className="py-2.5 pr-3 text-muted-foreground text-xs tabular-nums">
        {rank}
      </td>
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
            className="ml-1.5 text-muted-foreground"
            title="Verified metric (reported by Hugging Face)"
          >
            <HiCheck className="inline size-3.5" />
          </span>
        )}
        <span className="block text-[10px] text-muted-foreground">
          {row.metric}
        </span>
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
            className="inline-flex text-muted-foreground transition-colors hover:text-primary"
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
  const groups = useMemo(
    () => (data ? groupLeaderboardSections(data.sections) : []),
    [data]
  );
  const asrWerGroup = groups.find(
    (group) => group.task === "ASR" && /wer/i.test(group.metric)
  );

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1
            className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Benchmarks & rankings
          </h1>
          <ShareButton
            path="/leaderboard"
            title="Ethiopian AI benchmarks & rankings"
            text="Published evaluations for Ethiopian-language models — ASR, TTS, retrieval and more, with sources."
          />
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          How Ethiopian-language models compare on the numbers their authors
          published — ASR word error rates, retrieval accuracy, OCR and more.
          goha only normalizes formats; every row cites its source on Hugging
          Face. New results appear as the daily scrape picks them up.
        </p>
        {data?.builtAt && (
          <p className="mt-2 text-muted-foreground text-xs">
            Table built {new Date(data.builtAt).toISOString().slice(0, 10)} ·{" "}
            <Link
              href="/lineage"
              className="underline underline-offset-4 hover:text-primary"
            >
              explore the model lineage
            </Link>{" "}
            ·{" "}
            <Link
              href="/compare"
              className="underline underline-offset-4 hover:text-primary"
            >
              compare models side by side
            </Link>
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
      ) : isError || !data || groups.length === 0 ? (
        <EmptyState
          title="No published results yet"
          description="Once models publish evaluation tables, they rank here."
          className="my-16"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* pulse — ecosystem growth */}
          <section className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2
                className="text-base text-primary tracking-[-0.02em] md:text-lg"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Ecosystem growth
              </h2>
            </div>
            <p className="mt-1 text-muted-foreground text-xs">
              Everything the daily scrape has indexed — models and datasets,
              June to today.
            </p>
            <EcosystemGrowthChart className="mt-2 h-72 w-full md:h-80" />
          </section>

          {asrWerGroup && (
            <section className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5">
              <h2
                className="text-base text-primary tracking-[-0.02em] md:text-lg"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                {asrWerGroup.sectionName} — head to head
              </h2>
              <p className="mt-1 text-muted-foreground text-xs">
                Published {asrWerGroup.metric}, best at the top.
              </p>
              <WerBarChart
                rows={asrWerGroup.rows}
                className="mt-2 h-[380px] w-full md:h-[420px]"
              />
            </section>
          )}
          {groups.map((group) => (
            <SectionTable key={group.id} group={group} />
          ))}

          {/* traction — top models download trend */}
          <section className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5">
            <h2
              className="text-base text-primary tracking-[-0.02em] md:text-lg"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Who is being used
            </h2>
            <p className="mt-1 text-muted-foreground text-xs">
              Monthly download trend for the five most-used models — drag the
              brush or the plot to focus on a window.
            </p>
            <TopModelsChart className="mt-2 h-72 w-full md:h-80" />
          </section>
        </div>
      )}
    </div>
  );
}
