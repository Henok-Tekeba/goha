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

function fetchJson<T>(path: string): Promise<T> {
  return fetch(`${BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
    return res.json() as Promise<T>;
  });
}

export function getAllProjects(): Promise<Project[]> {
  projectsCache ??= fetchJson<Project[]>("/data/projects.json").then((list) =>
    list.map((p) => ({ ...p, logoUrl: p.logoUrl ? asset(p.logoUrl) : p.logoUrl }))
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
