/**
 * goha's filter/pagination semantics — one implementation used by the
 * deployed API routes and the client-side data adapter.
 */
import type { Project } from "@/features/projects/types/project.type";
import type { PaginatedResponse } from "@/shared/types/pagination.type";

export function multi(sp: URLSearchParams, key: string): string[] {
  const values: string[] = [];
  for (const v of sp.getAll(key)) values.push(...v.split(","));
  return values.filter(Boolean);
}

export function filterProjects(sp: URLSearchParams, all: Project[]): Project[] {
  let results = all;

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

export function paginate<T>(
  items: T[],
  page: number,
  size: number
): PaginatedResponse<T> {
  return {
    data: items.slice((page - 1) * size, page * size),
    pagination: {
      total: items.length,
      lastPage: Math.max(1, Math.ceil(items.length / size)),
      currentPage: page,
      size,
    },
  };
}

export function paramsToSearchParams(
  params?: Record<string, unknown>
): URLSearchParams {
  const sp = new URLSearchParams();
  if (!params) return sp;
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    sp.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return sp;
}

export const emptyPaginated = <T>(): PaginatedResponse<T> => ({
  data: [],
  pagination: { total: 0, lastPage: 1, currentPage: 1, size: 20 },
});
