/**
 * Launch-film data — the same public fixtures the site's own evilcharts
 * components render, imported statically so playback never waits on a fetch
 * and every run draws the same numbers.
 *
 * Files are the build-time outputs of scripts/build-goha-fixtures.mjs:
 *   public/data/growth.json            → /leaderboard "Ecosystem growth"
 *   public/data/leaderboard.json       → /leaderboard WER sections
 *   public/data/language-coverage.json → /lang "The gaps, side by side"
 */

import type {
  GrowthPayload,
  LanguageCoveragePayload,
  Leaderboard,
} from "@/features/ecosystem/types/ecosystem.types";
import growthRaw from "../../../../public/data/growth.json";
import coverageRaw from "../../../../public/data/language-coverage.json";
import leaderboardRaw from "../../../../public/data/leaderboard.json";

const growth = growthRaw as unknown as GrowthPayload;
const leaderboard = leaderboardRaw as unknown as Leaderboard;

/** Daily models/datasets totals — what EcosystemGrowthChart plots. */
export const filmGrowth = growth.data;

/** Language × task coverage — what LanguageRadarChart plots. */
export const filmCoverage = coverageRaw as unknown as LanguageCoveragePayload;

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
