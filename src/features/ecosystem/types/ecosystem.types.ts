/* goha ecosystem surfaces — activity, stats, insights, orgs, papers,
   leaderboard. Shapes mirror the JSON emitted by
   scripts/build-goha-fixtures.mjs into /public/data/*.json. */

export interface EcosystemStatsCounts {
  models: number;
  datasets: number;
  papers: number;
  companies: number;
  spaces: number;
  repos: number;
  languages: number;
  orgs: number;
}

export interface EcosystemStats {
  counts: EcosystemStatsCounts;
  indexedAt: string;
  featured: {
    name: string;
    org: string | null;
    downloads: number;
  } | null;
}

export type ActivityEventType =
  | "new_model"
  | "new_dataset"
  | "new_paper"
  | "milestone"
  | "trending";

export interface ActivityEvent {
  id: number;
  type: ActivityEventType;
  label: string;
  title: string;
  detail: string | null;
  entityId: string | null;
  entityType: string | null;
  projectId: string | null;
  url: string;
  at: string | null;
  ago: string | null;
}

export interface ActivityPayload {
  data: ActivityEvent[];
  builtAt: string;
}

export interface InsightGainer {
  id: string;
  name: string;
  org: string | null;
  growth: number;
  gain: number;
  start: number;
  end: number;
  projectId: string | null;
}

export interface InsightDownloaded {
  id: string;
  name: string;
  org: string | null;
  dl: number;
  projectId: string | null;
}

export interface Insights {
  topGainers: InsightGainer[];
  mostDownloaded: InsightDownloaded[];
  builtAt: string;
}

export interface OrgRecord {
  slug: string;
  key: string;
  name: string;
  kind: "company" | "lab" | "individual";
  desc: string | null;
  website: string | null;
  github: string | null;
  hfOrg: string | null;
  founded: string | null;
  verified: boolean;
  isNew: boolean;
  featured: boolean;
  langs: string[];
  counts: {
    models: number;
    datasets: number;
    spaces: number;
    repos: number;
  };
  downloadsMonthly: number;
  likes: number;
  topModels: {
    name: string;
    id: string;
    projectId: string | null;
    dl: number;
  }[];
  topRepos: {
    name: string;
    url: string | null;
    stars: number;
    desc: string | null;
  }[];
  topSpaces: {
    name: string;
    url: string | null;
    likes: number;
  }[];
}

export interface OrgsPayload {
  data: OrgRecord[];
  builtAt: string;
}

export interface PaperRecord {
  slug: string;
  arxivId: string | null;
  title: string;
  authors: string[];
  abstract: string | null;
  published: string | null;
  year: number | null;
  url: string | null;
  categories: string[];
  languages: string[];
  tasks: string[];
  projectId: string | null;
}

export interface PapersPayload {
  data: PaperRecord[];
  builtAt: string;
}

export interface LeaderboardRow {
  model: string;
  org: string;
  projectId: string | null;
  languages: string[];
  dataset: string | null;
  metric: string;
  metricType: string;
  value: number | null;
  display: string;
  verified: boolean;
  downloads: number;
  likes: number;
  source: string | null;
}

export interface LeaderboardSection {
  id: string;
  task: string;
  name: string;
  lowerIsBetter: boolean;
  languages: string[];
  rows: LeaderboardRow[];
}

export interface Leaderboard {
  builtAt: string;
  sections: LeaderboardSection[];
}

/* ---------------- charts ---------------- */

export interface GrowthPoint {
  date: string;
  models: number;
  datasets: number;
  downloads: number;
}

export interface GrowthPayload {
  data: GrowthPoint[];
  builtAt: string;
}

export interface TopModelSeries {
  id: string;
  name: string;
  org: string | null;
  projectId: string | null;
  dl: number;
}

export interface TopModelHistoryPayload {
  rows: Record<string, unknown>[];
  series: TopModelSeries[];
  builtAt: string;
}

export interface LanguageCoveragePayload {
  rows: Record<string, number | string>[];
  languages: string[];
  tasks: string[];
}

export interface LanguageRecord {
  name: string;
  slug: string;
  glyph: string;
}

export interface LanguagesPayload {
  data: LanguageRecord[];
}

/** Language index entry enriched with its total indexed assets. */
export interface LanguageTile extends LanguageRecord {
  total: number;
}

/* ---------------- lineage ---------------- */

export interface LineageNode {
  id: string;
  name: string;
  org: string | null;
  external: boolean;
  downloads: number;
  langs: string[];
  task: string | null;
  projectId: string | null;
  family: string;
  x: number;
  y: number;
}

export interface LineageFamily {
  family: string;
  top: number;
  height: number;
  count: number;
  models: number;
}

export interface LineagePayload {
  nodes: LineageNode[];
  links: { source: string; target: string }[];
  families: LineageFamily[];
  stats: { models: number; foundations: number; families: number };
  builtAt: string;
}

export interface OrgRadarAxis {
  axis: string;
  label: string;
  value: number /* raw count */;
  max: number /* ecosystem max, for normalization */;
}
