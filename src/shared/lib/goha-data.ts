/**
 * goha data module for the deployed API routes.
 * The committed fixture file IS the pipeline output:
 *   scraper → data/*.json → scripts/build-goha-fixtures.mjs → data/projects.mock.json
 */

import rawProjects from "@data/projects.mock.json";
import { categories, techStacks } from "@data/taxonomy.mock";
import type { Project } from "@/features/projects/types/project.type";

export const projects = rawProjects as unknown as Project[];
export { categories, techStacks };

export function multi(sp: URLSearchParams, key: string): string[] {
  const values: string[] = [];
  for (const v of sp.getAll(key)) values.push(...v.split(","));
  return values.filter(Boolean);
}

export function filterProjects(sp: URLSearchParams): Project[] {
  let results = projects;

  const published = sp.get("published");
  if (published !== null)
    results = results.filter((p) => p.published === (published === "true"));

  const trending = sp.get("trending");
  if (trending !== null)
    results = results.filter((p) => p.trending === (trending === "true"));

  const stacks = multi(sp, "techStacks");
  if (stacks.length) {
    results = results.filter((p) =>
      p.projectTechStacks?.some(
        (t) => stacks.includes(t.id) || stacks.includes(t.name)
      )
    );
  }

  const cats = multi(sp, "categories");
  if (cats.length) {
    results = results.filter((p) =>
      p.projectCategories?.some(
        (c) => cats.includes(c.id) || cats.includes(c.name)
      )
    );
  }

  const orderBy = sp.get("orderBy");
  const direction = sp.get("orderDirection") === "asc" ? 1 : -1;
  if (orderBy) {
    results = [...results].sort((a, b) => {
      if (orderBy === "title")
        return a.title.localeCompare(b.title) * direction;
      if (orderBy === "trending")
        return (Number(b.trending) - Number(a.trending)) * -direction;
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
        direction
      );
    });
  }

  return results;
}
