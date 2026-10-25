"use client";

import { usePathname, useRouter } from "next/navigation";

import { filtersToURLParams } from "../lib/project-filters-url";
import type { ProjectFilters } from "../types/project-filters.type";
import ProjectDiscoveryHero from "./project-discovery-hero.component";

/**
 * The hero's filter bar is interactive, so it stays a client island.
 * The rest of the landing dashboard is prerendered from build-time data.
 */
export default function DashboardHero() {
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (filters: ProjectFilters) => {
    const queryString = filtersToURLParams(filters).toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  return <ProjectDiscoveryHero onFilterChange={handleFilterChange} />;
}
