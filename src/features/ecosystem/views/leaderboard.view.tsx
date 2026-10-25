"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { HiArrowTopRightOnSquare, HiCheck } from "react-icons/hi2";
import ShareButton from "@/shared/components/share/share-button.component";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import EcosystemGrowthChart from "../components/charts/ecosystem-growth-chart";
import TopModelsChart from "../components/charts/top-models-chart";
import WerBarChart from "../components/charts/wer-bar-chart";
import {
  groupLeaderboardSections,
  type LeaderboardGroup,
} from "../lib/leaderboard-groups";
import type {
  GrowthPayload,
  Leaderboard,
  LeaderboardRow,
  TopModelHistoryPayload,
} from "../types/ecosystem.types";

function csvEscape(value: string | number | null): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(group: LeaderboardGroup) {
  const header = [
    "rank",
    "model",
    "org",
    "language",
    "evaluated_on",
    "embedding_dim",
    "metric",
    "value",
    "verified",
    "downloads",
    "evaluation_source",
    "source",
  ];
  const rows = [...group.rows, ...group.unrankedRows];
  const showRank = group.rows.length > 1;
  const lines = rows.map((row, i) =>
    [
      showRank && i < group.rows.length ? i + 1 : "",
      row.model,
      row.org,
      group.language ?? row.languages.join(";"),
      row.dataset ?? "not stated",
      row.embeddingDim ?? "",
      row.metric,
      row.display,
      row.verified ? "yes" : "no",
      row.downloads,
      row.evaluationSource,
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

function EvaluatedOnLink({ row }: { row: LeaderboardRow }) {
  const href = row.evaluationSource ?? row.source;
  const isModelCard = row.evaluationSourceKind === "model-card";
  const label = isModelCard ? "model card" : (row.dataset ?? "not stated");
  const lead = isModelCard ? "Reported in" : "Evaluated on";
  const detail = isModelCard && row.dataset ? ` · ${row.dataset}` : "";
  if (!href)
    return (
      <span className="text-muted-foreground">
        {lead} {label}
        {detail}
      </span>
    );
  return (
    <span className="text-muted-foreground">
      {lead}{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-primary"
        title={`Open evaluation source for ${row.model}`}
      >
        {label}
      </a>
      {detail}
    </span>
  );
}

function MobileRows({
  rows,
  ranked,
  showDim,
  showRank,
}: {
  rows: LeaderboardRow[];
  ranked: boolean;
  showDim: boolean;
  showRank: boolean;
}) {
  return (
    <div className="mt-3 flex flex-col divide-y divide-muted-black-stroke rounded-[14px] border border-muted-black-stroke md:hidden">
      {rows.map((row, i) => (
        <div
          key={`${row.model}-${row.embeddingDim ?? ""}-${i}`}
          className="px-3 py-2.5"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate font-medium text-primary text-sm">
                {ranked && showRank ? `${i + 1}. ` : ""}
                {row.model}
              </span>
              <span className="block truncate text-muted-foreground text-xs">
                {row.org}
                {row.languages.length
                  ? ` · ${row.languages.slice(0, 2).join(", ")}`
                  : ""}
                {showDim && row.embeddingDim ? ` · ${row.embeddingDim}d` : ""}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-medium text-primary text-sm tabular-nums">
                {row.display}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {row.metric}
              </span>
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-muted-foreground text-xs">
            <span className="min-w-0 truncate">
              <EvaluatedOnLink row={row} />
            </span>
            <span className="flex shrink-0 items-center gap-3">
              {row.downloads > 0 && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <FaDownload className="size-2.5" />
                  {formatNumberShort(row.downloads)}
                </span>
              )}
              {row.source && (
                <a
                  href={row.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open source for ${row.model}`}
                  className="inline-flex text-muted-foreground hover:text-primary"
                >
                  <HiArrowTopRightOnSquare className="size-4" />
                </a>
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RowsTable({
  rows,
  ranked,
  showDim,
  showRank,
}: {
  rows: LeaderboardRow[];
  ranked: boolean;
  showDim: boolean;
  showRank: boolean;
}) {
  return (
    <div className="mt-3 hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-muted-black-stroke border-b text-left text-muted-foreground text-xs">
            <th className="py-2 pr-3 font-medium">#</th>
            <th className="py-2 pr-3 font-medium">Model</th>
            <th className="py-2 pr-3 font-medium">Language</th>
            <th className="py-2 pr-3 font-medium">Evaluated on</th>
            {showDim && (
              <th className="py-2 pr-3 text-right font-medium">Dim</th>
            )}
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
              key={`${row.model}-${row.embeddingDim ?? ""}-${i}`}
              row={row}
              rank={ranked && showRank ? i + 1 : null}
              showDim={showDim}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionTable({ group }: { group: LeaderboardGroup }) {
  const [language, setLanguage] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      group.rows.filter((row) => !language || row.languages.includes(language)),
    [group, language]
  );
  const unrankedRows = useMemo(
    () =>
      group.unrankedRows.filter(
        (row) => !language || row.languages.includes(language)
      ),
    [group, language]
  );
  const showDim = [...rows, ...unrankedRows].some(
    (row) => row.embeddingDim != null
  );
  const showRank = rows.length > 1;

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
        {rows.length} {rows.length === 1 ? "result" : "ranked"}
        {unrankedRows.length ? ` · ${unrankedRows.length} not ranked` : ""} — as
        published by the model authors
      </p>

      {rows.length > 0 && (
        <>
          <MobileRows
            rows={rows}
            ranked
            showDim={showDim}
            showRank={showRank}
          />
          <RowsTable rows={rows} ranked showDim={showDim} showRank={showRank} />
        </>
      )}

      {unrankedRows.length > 0 && (
        <div className="mt-5 rounded-[14px] border border-muted-black-stroke border-dashed px-3 py-3">
          <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Not ranked — test set not stated
          </h3>
          <p className="mt-1 text-muted-foreground text-xs">
            These results are shown for transparency but cannot be compared
            without an evaluation set.
          </p>
          <MobileRows
            rows={unrankedRows}
            ranked={false}
            showDim={showDim}
            showRank={false}
          />
          <RowsTable
            rows={unrankedRows}
            ranked={false}
            showDim={showDim}
            showRank={false}
          />
        </div>
      )}
    </section>
  );
}

function LeaderboardRowView({
  row,
  rank,
  showDim,
}: {
  row: LeaderboardRow;
  rank: number | null;
  showDim: boolean;
}) {
  const external = !row.projectId;
  const modelHref = row.projectId
    ? `/projects/${row.projectId}`
    : (row.source ?? "#");
  return (
    <tr className="border-muted-black-stroke border-b last:border-b-0">
      <td className="py-2.5 pr-3 text-muted-foreground text-xs tabular-nums">
        {rank ?? "—"}
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
      <td className="max-w-[200px] py-2.5 pr-3">
        <span className="block truncate text-xs">
          <EvaluatedOnLink row={row} />
        </span>
      </td>
      {showDim && (
        <td className="py-2.5 pr-3 text-right text-muted-foreground text-xs tabular-nums">
          {row.embeddingDim ?? "—"}
        </td>
      )}
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

export default function LeaderboardView({
  leaderboard,
  growth,
  topModels,
}: {
  leaderboard: Leaderboard;
  growth: GrowthPayload;
  topModels: TopModelHistoryPayload;
}) {
  const groups = useMemo(
    () => groupLeaderboardSections(leaderboard.sections),
    [leaderboard]
  );
  const asrWerGroups = groups.filter(
    (group) =>
      group.task === "ASR" && /wer/i.test(group.metric) && group.rows.length > 1
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
        {leaderboard.builtAt && (
          <p className="mt-2 text-muted-foreground text-xs">
            Table built{" "}
            {new Date(leaderboard.builtAt).toISOString().slice(0, 10)} ·{" "}
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

      {groups.length === 0 ? (
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
            <EcosystemGrowthChart
              data={growth.data}
              className="mt-2 h-72 w-full md:h-80"
            />
          </section>

          {asrWerGroups.map((group) => (
            <section
              key={`chart-${group.id}`}
              className="rounded-[20px] border border-muted-black-stroke px-4 py-4 md:px-6 md:py-5"
            >
              <h2
                className="text-base text-primary tracking-[-0.02em] md:text-lg"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                {group.language ?? "ASR"} — head to head
              </h2>
              <p className="mt-1 text-muted-foreground text-xs">
                Published {group.metric}, best at the top. Test set:{" "}
                {group.testSet ?? "not stated"}.
              </p>
              <WerBarChart
                rows={group.rows}
                className="mt-2 h-[380px] w-full md:h-[420px]"
              />
            </section>
          ))}
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
            <TopModelsChart
              payload={topModels}
              className="mt-2 h-72 w-full md:h-80"
            />
          </section>
        </div>
      )}
    </div>
  );
}
