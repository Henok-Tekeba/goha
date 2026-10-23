/**
 * Server/build-context access to goha.et's committed data.
 * The bundler inlines the JSON — never imported by client code.
 */

import type { Project } from "@/features/projects/types/project.type";
import rawProjects from "@/mocks/fixtures/projects.mock.json";
import { categories, techStacks as rawStacks } from "@/mocks/fixtures/taxonomy.mock";

import { asset } from "@/shared/lib/asset";

/* Baking the base path into data-driven asset URLs (logoUrl, iconUrl)
   means consumers need no changes at all. */
export const projects: Project[] = (rawProjects as unknown as Project[]).map(
  (p) => ({ ...p, logoUrl: p.logoUrl ? asset(p.logoUrl) : p.logoUrl })
);
export const techStacks = rawStacks.map((t) => ({
  ...t,
  iconUrl: t.iconUrl ? asset(t.iconUrl) : t.iconUrl,
}));
export { categories };

export async function getAllProjects(): Promise<Project[]> {
  return projects;
}

export async function getTaxonomyData() {
  return { categories, techStacks };
}
