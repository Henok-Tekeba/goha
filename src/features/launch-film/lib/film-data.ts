/**
 * Launch-film data — the same public fixtures the site's own evilcharts
 * components render, imported statically so playback never waits on a fetch
 * and every run draws the same numbers.
 *
 * Files are the build-time outputs of scripts/build-goha-fixtures.mjs:
 *   public/data/stats.json               → record counts (/gaps, homepage band)
 *   public/data/top-models-history.json  → most-used models (/leaderboard)
 *   public/data/leaderboard.json         → /leaderboard WER sections
 *   public/data/language-coverage.json   → /lang "The gaps, side by side"
 */

import type {
  EcosystemStats,
  LanguageCoveragePayload,
  Leaderboard,
  TopModelHistoryPayload,
} from "@/features/ecosystem/types/ecosystem.types";
import coverageRaw from "../../../../public/data/language-coverage.json";
import leaderboardRaw from "../../../../public/data/leaderboard.json";
import statsRaw from "../../../../public/data/stats.json";
import topModelsRaw from "../../../../public/data/top-models-history.json";

const stats = statsRaw as unknown as EcosystemStats;
const leaderboard = leaderboardRaw as unknown as Leaderboard;

/** Language × task coverage — what LanguageRadarChart plots. */
export const filmCoverage = coverageRaw as unknown as LanguageCoveragePayload;

/** The index's composition, straight from the live counts — one entry per
    slice of the film's donut, summing to the published record total. */
export const filmComposition = [
  { name: "Models", value: stats.counts.models },
  { name: "Datasets", value: stats.counts.datasets },
  { name: "Papers", value: stats.counts.papers },
  { name: "Companies", value: stats.counts.companies },
];

export const filmTotalRecords = filmComposition.reduce(
  (total, part) => total + part.value,
  0
);

/** The most-used models, most downloads first — the /leaderboard
    "Who is being used" ranking. */
export const filmTopModels = [
  ...(topModelsRaw as unknown as TopModelHistoryPayload).series,
]
  .sort((a, b) => b.dl - a.dl)
  .slice(0, 3);

/** The real WER leaderboard rows from the ASR section, lowest first — the
    same rows the /leaderboard ASR section publishes (metricType "wer"). */
const asrSection =
  leaderboard.sections.find((section) => section.task === "ASR") ??
  leaderboard.sections[0];

export const filmWerRows = asrSection.rows
  .filter((row) => row.metricType === "wer" && row.value != null)
  .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
  .map((row) => ({
    model: `${row.model} · ${row.org}`,
    wer: Math.round((row.value ?? 0) * 100) / 100,
  }));
