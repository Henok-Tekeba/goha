import type { ProjectFilters } from "../types/project-filters.type";

/** Converts URL search params to ProjectFilters. */
export function parseFiltersFromURL(
  searchParams: URLSearchParams
): ProjectFilters {
  const techStacksParam = searchParams.get("techStacks");
  const categoriesParam = searchParams.get("categories");
  const orderByParam = searchParams.get("orderBy");
  const orderDirectionParam = searchParams.get("orderDirection");

  const validOrderBy: ProjectFilters["orderBy"] =
    orderByParam === "createdAt" ||
    orderByParam === "title" ||
    orderByParam === "trending"
      ? orderByParam
      : "trending";

  const validOrderDirection: ProjectFilters["orderDirection"] =
    orderDirectionParam === "asc" || orderDirectionParam === "desc"
      ? orderDirectionParam
      : "desc";

  return {
    techStacks: techStacksParam
      ? techStacksParam.split(",").filter(Boolean)
      : [],
    categories: categoriesParam
      ? categoriesParam.split(",").filter(Boolean)
      : [],
    orderBy: validOrderBy,
    orderDirection: validOrderDirection,
  };
}

export function filtersToURLParams(filters: ProjectFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.techStacks.length > 0) {
    params.set("techStacks", filters.techStacks.join(","));
  }

  if (filters.categories.length > 0) {
    params.set("categories", filters.categories.join(","));
  }

  if (filters.orderBy !== "trending") {
    params.set("orderBy", filters.orderBy);
  }

  if (filters.orderDirection !== "desc") {
    params.set("orderDirection", filters.orderDirection);
  }

  return params;
}
