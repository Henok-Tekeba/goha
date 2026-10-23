import type { ApiRequestContext } from "@/shared/lib/api-client";

import type { TechStackType } from "../types/tech-stack.type";

const isServer = typeof window === "undefined";

export async function getTechStacks(
  _context: ApiRequestContext = {}
): Promise<TechStackType[]> {
  const loader = isServer
    ? import("@/shared/lib/local-data.server")
    : import("@/shared/lib/local-data.client");
  const { getTaxonomyData } = await loader;
  return (await getTaxonomyData()).techStacks;
}
