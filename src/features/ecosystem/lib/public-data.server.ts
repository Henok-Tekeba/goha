/**
 * Typed, build-time access to the JSON emitted by
 * scripts/build-goha-fixtures.mjs into public/data/.
 *
 * These files are static assets for the browser, but importing them here lets
 * server components prerender pages from the same data without a round trip.
 */

import rawActivity from "../../../../public/data/activity.json";
import rawInsights from "../../../../public/data/insights.json";
import rawLanguageCoverage from "../../../../public/data/language-coverage.json";
import rawLeaderboard from "../../../../public/data/leaderboard.json";
import rawLineage from "../../../../public/data/lineage.json";
import rawPapers from "../../../../public/data/papers.json";
import rawStats from "../../../../public/data/stats.json";
import type {
  ActivityEvent,
  ActivityPayload,
  EcosystemStats,
  Insights,
  LanguageCoveragePayload,
  Leaderboard,
  LineagePayload,
  PaperRecord,
  PapersPayload,
} from "../types/ecosystem.types";

export function getPublicStats(): EcosystemStats {
  return rawStats as EcosystemStats;
}

export function getPublicInsights(): Insights {
  return rawInsights as Insights;
}

export function getPublicActivity(): ActivityEvent[] {
  return (rawActivity as ActivityPayload).data;
}

export function getPublicPapers(): PaperRecord[] {
  return (rawPapers as PapersPayload).data;
}

export function getPublicLanguageCoverage(): LanguageCoveragePayload {
  return rawLanguageCoverage as LanguageCoveragePayload;
}

export function getPublicLeaderboard(): Leaderboard {
  return rawLeaderboard as Leaderboard;
}

export function getPublicLineage(): LineagePayload {
  return rawLineage as LineagePayload;
}
