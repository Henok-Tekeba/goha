const OWNER = process.env.NEXT_PUBLIC_GH_OWNER || "Henok-Tekeba";
const REPO = process.env.NEXT_PUBLIC_GH_REPO || "goha";
const BRANCH = process.env.NEXT_PUBLIC_GH_BRANCH || "main";
const BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data`;

export async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json();
}

/* Typed wrappers matching the build.mjs output format */
import type { Stats } from "@/types";

interface Payload<T> { data: T[]; total: number; page: number; limit: number; }
interface SinglePayload<T> { data: T; total: number; page: number; limit: number; }
interface TrendingPayload { items: any[]; label: string; }
interface QuickstartPayload { guides: any[]; }

export function fetchModels() { return fetchJSON<Payload<any>>("models.json"); }
export function fetchDatasets() { return fetchJSON<Payload<any>>("datasets.json"); }
export function fetchPapers() { return fetchJSON<Payload<any>>("papers.json"); }
export function fetchCompanies() { return fetchJSON<Payload<any>>("companies.json"); }
export function fetchStats() { return fetchJSON<SinglePayload<Stats>>("stats.json"); }
export function fetchTrending() { return fetchJSON<TrendingPayload>("trending.json"); }
export function fetchActivityFeed() { return fetchJSON<any[]>("activity_feed.json"); }
export function fetchQuickstart() { return fetchJSON<QuickstartPayload>("quickstart.json"); }
export function fetchStatsHistory() { return fetchJSON<StatsHistoryEntry[]>("stats_history.json"); }
export function fetchStatsInsights() { return fetchJSON<StatsInsights>("stats_insights.json"); }
export function fetchModelSnapshots() { return fetchJSON<Record<string, ModelSnapshotTimeline>>("model_snapshots.json"); }
export function fetchDatasetSnapshots() { return fetchJSON<Record<string, DatasetSnapshotTimeline>>("dataset_snapshots.json"); }

export interface StatsHistoryEntry {
  date: string;
  models: number;
  datasets: number;
  totalModelDownloads: number;
  totalLikes: number;
  totalDatasetDownloads: number;
}

export interface StatsInsights {
  topGainers: TopGainer[];
  milestones: Milestone[];
}

export interface TopGainer {
  id: string;
  name: string;
  org: string;
  gain: number;
  growth: number;
  start: number;
  end: number;
}

export interface Milestone {
  id: string;
  milestone: number;
  downloads: number;
  date: string;
}

export interface ModelSnapshotTimeline {
  dates: string[];
  downloads: number[];
  likes: number[];
}

export interface DatasetSnapshotTimeline {
  dates: string[];
  downloads: number[];
}

/* Server-side helpers for detail pages */
export async function fetchModelById(id: string) {
  const { data } = await fetchModels();
  return (data as any[]).find((m: any) => m.id === id) ?? null;
}

export async function fetchDatasetById(id: string) {
  const { data } = await fetchDatasets();
  return (data as any[]).find((d: any) => d.id === id) ?? null;
}

export async function fetchCompanyBySlug(slug: string) {
  const { data } = await fetchCompanies();
  return (data as any[]).find((c: any) => c.name.toLowerCase().replace(/\s+/g, '-') === slug) ?? null;
}

export async function fetchPaperByArxivId(arxivId: string) {
  const { data } = await fetchPapers();
  return (data as any[]).find((p: any) => p.arxiv_id === arxivId) ?? null;
}
