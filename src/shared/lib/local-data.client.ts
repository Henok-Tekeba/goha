/**
 * Client-context access to goha.et's data on GitHub Pages:
 * static JSON files under /data, fetched once and memoized.
 */

import type { Project } from "@/features/projects/types/project.type";
import { asset } from "@/shared/lib/asset";
import type { CategoryType } from "@/shared/types/category.type";
import type { TechStackType } from "@/shared/types/tech-stack.type";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let projectsCache: Promise<Project[]> | null = null;
let taxonomyCache: Promise<{
  categories: CategoryType[];
  techStacks: TechStackType[];
}> | null = null;
const jsonCache = new Map<string, Promise<unknown>>();

function fetchJson<T>(path: string): Promise<T> {
  return fetch(`${BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return res.json() as Promise<T>;
  });
}

function fetchJsonCached<T>(path: string): Promise<T> {
  if (!jsonCache.has(path)) jsonCache.set(path, fetchJson<T>(path));
  return jsonCache.get(path) as Promise<T>;
}

export function getAllProjects(): Promise<Project[]> {
  projectsCache ??= fetchJson<Project[]>("/data/projects.json").then((list) =>
    list.map((p) => ({
      ...p,
      logoUrl: p.logoUrl ? asset(p.logoUrl) : p.logoUrl,
      projectTechStacks: (p.projectTechStacks ?? []).map((t) => ({
        ...t,
        iconUrl: t.iconUrl ? asset(t.iconUrl) : t.iconUrl,
      })),
    }))
  );
  return projectsCache;
}

export function getTaxonomyData() {
  taxonomyCache ??= fetchJson<{
    categories: CategoryType[];
    techStacks: TechStackType[];
  }>("/data/taxonomy.json").then((tax) => ({
    ...tax,
    techStacks: tax.techStacks.map((t) => ({
      ...t,
      iconUrl: t.iconUrl ? asset(t.iconUrl) : t.iconUrl,
    })),
  }));
  return taxonomyCache;
}

/* ---------------- ecosystem surfaces (fetched client-side) ---------------- */

import type {
  ActivityEvent,
  ActivityEventType,
  ActivityPayload,
  EcosystemStats,
  Insights,
  Leaderboard,
  OrgRecord,
  OrgsPayload,
  PaperRecord,
  PapersPayload,
} from "@/features/ecosystem/types/ecosystem.types";

export function getEcosystemStats(): Promise<EcosystemStats> {
  return fetchJsonCached<EcosystemStats>("/data/stats.json");
}

export function getActivityEvents(): Promise<ActivityEvent[]> {
  return fetchJsonCached<ActivityPayload>("/data/activity.json").then(
    (payload) => payload.data
  );
}

export function getActivityEventsByType(
  type: ActivityEventType
): Promise<ActivityEvent[]> {
  return getActivityEvents().then((events) =>
    events.filter((event) => event.type === type)
  );
}

export function getInsights(): Promise<Insights> {
  return fetchJsonCached<Insights>("/data/insights.json");
}

export function getOrgs(): Promise<OrgRecord[]> {
  return fetchJsonCached<OrgsPayload>("/data/orgs.json").then(
    (payload) => payload.data
  );
}

export function getOrgBySlug(slug: string): Promise<OrgRecord | undefined> {
  return getOrgs().then((orgs) => orgs.find((org) => org.slug === slug));
}

export function getPapers(): Promise<PaperRecord[]> {
  return fetchJsonCached<PapersPayload>("/data/papers.json").then(
    (payload) => payload.data
  );
}

export function getLeaderboard(): Promise<Leaderboard> {
  return fetchJsonCached<Leaderboard>("/data/leaderboard.json");
}
