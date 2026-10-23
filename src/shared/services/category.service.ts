import type { ApiRequestContext } from "@/shared/lib/api-client";

import type { CategoryType } from "../types/category.type";

const isServer = typeof window === "undefined";

export async function getCategories(
  _context: ApiRequestContext = {}
): Promise<CategoryType[]> {
  const loader = isServer
    ? import("@/shared/lib/local-data.server")
    : import("@/shared/lib/local-data.client");
  const { getTaxonomyData } = await loader;
  return (await getTaxonomyData()).categories;
}
