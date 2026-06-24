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
