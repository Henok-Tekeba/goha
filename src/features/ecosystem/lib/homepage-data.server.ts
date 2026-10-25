/**
 * Build-time data for the landing dashboard.
 *
 * goha is a static export (`output: "export"`), so "server side" here means
 * prerendered at build time. Importing the generated JSON directly lets the
 * dashboard HTML ship with content instead of skeletons + client fetches.
 */

import type { Project } from "@/features/projects/types/project.type";
import {
  getAllProjects,
  languages as languageIndex,
} from "@/shared/lib/local-data.server";

import type {
  ActivityEvent,
  EcosystemStats,
  InsightGainer,
  LanguageTile,
  PaperRecord,
} from "../types/ecosystem.types";
import {
  getPublicActivity,
  getPublicInsights,
  getPublicLanguageCoverage,
  getPublicPapers,
  getPublicStats,
} from "./public-data.server";

export interface HomepageDashboardData {
  stats: EcosystemStats;
  movers: InsightGainer[];
  models: Project[];
  totalModels: number;
  papers: PaperRecord[];
  languages: LanguageTile[];
  activity: ActivityEvent[];
}

const MODELS_COUNT = 6;
const NEW_PAPERS_COUNT = 4;
const ACTIVITY_COUNT = 5;
const MOVERS_COUNT = 6;

export async function getHomepageDashboardData(): Promise<HomepageDashboardData> {
  const stats = getPublicStats();
  const insights = getPublicInsights();
  const activity = getPublicActivity();
  const papers = getPublicPapers();
  const coverage = getPublicLanguageCoverage();

  const allProjects = await getAllProjects();
  const models = allProjects.filter((project) =>
    project.projectCategories?.some((category) => category.name === "Model")
  );
  const topModels = [...models]
    .sort((a, b) => (b.downloadsMonthly ?? 0) - (a.downloadsMonthly ?? 0))
    .slice(0, MODELS_COUNT);

  const languageTotals = new Map<string, number>();
  for (const row of coverage.rows) {
    for (const [key, value] of Object.entries(row)) {
      if (key === "task" || typeof value !== "number") continue;
      languageTotals.set(key, (languageTotals.get(key) ?? 0) + value);
    }
  }

  const languages = languageIndex
    .map((language) => ({
      ...language,
      total: languageTotals.get(language.name) ?? 0,
    }))
    .filter((language) => language.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    stats,
    movers: insights.topGainers.slice(0, MOVERS_COUNT),
    models: topModels,
    totalModels: models.length,
    papers: papers.slice(0, NEW_PAPERS_COUNT),
    languages,
    activity: activity.slice(0, ACTIVITY_COUNT),
  };
}
