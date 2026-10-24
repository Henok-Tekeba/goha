"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo } from "react";
import { HiMiniSquare2Stack } from "react-icons/hi2";

import ActivityPreview from "@/features/ecosystem/components/dashboard/activity-preview.component";
import LanguageTiles from "@/features/ecosystem/components/dashboard/language-tiles.component";
import MostUsedModels from "@/features/ecosystem/components/dashboard/most-used-models.component";
import RecentResearch from "@/features/ecosystem/components/dashboard/recent-research.component";
import EcosystemStatsBand from "@/features/ecosystem/components/ecosystem-stats-band.component";
import MoversSection from "@/features/ecosystem/components/movers-section.component";
import ProjectDiscoveryHero from "@/features/projects/components/project-discovery-hero.component";
import { Button } from "@/shared/components/ui/button";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination.component";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import ProjectGrid from "../components/project-grid.component";
import SkeletonProjectGrid from "../components/skeletons/skeleton-project-grid.component";
import { projectKeys } from "../hooks/project.keys";
import { useProjectsQuery } from "../hooks/project.queries";
import type { ProjectFilters } from "../types/project-filters.type";

const PAGE_SIZE = 12;

interface HomepageLayoutProps {
  children: React.ReactNode;
  onFilterChange?: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: ProjectFilters;
  showStats?: boolean;
}

function HomepageLayout({
  children,
  onFilterChange,
  isLoading,
  initialFilters,
  showStats = true,
}: HomepageLayoutProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <ProjectDiscoveryHero
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          initialFilters={initialFilters}
        />
        {showStats && <EcosystemStatsBand />}
      </div>
      <div className="mx-6 mb-20 max-w-6xl md:mb-36 lg:mx-auto">{children}</div>
    </>
  );
}

/**
 * Converts URL search params to ProjectFilters
 */
function parseFiltersFromURL(searchParams: URLSearchParams): ProjectFilters {
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

function filtersToURLParams(filters: ProjectFilters): URLSearchParams {
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

/* ------------------------------------------------------------------------- */
/* Browse — paginated results for an active filter/search                     */
/* ------------------------------------------------------------------------- */

function BrowseResults({
  filters,
  page,
  onFilterChange,
  onClear,
}: {
  filters: ProjectFilters;
  page: number;
  onFilterChange: (filters: ProjectFilters) => void;
  onClear: () => void;
}) {
  const { data, isLoading, isError } = useProjectsQuery({
    ...filters,
    page,
    per_page: PAGE_SIZE,
    published: true,
  });

  if (isLoading) {
    return (
      <HomepageLayout
        onFilterChange={onFilterChange}
        isLoading
        initialFilters={filters}
        showStats={false}
      >
        <SkeletonProjectGrid />
      </HomepageLayout>
    );
  }

  if (isError) {
    return (
      <HomepageLayout
        onFilterChange={onFilterChange}
        isLoading={false}
        initialFilters={filters}
        showStats={false}
      >
        <ErrorState
          message="An error has occurred while loading the projects. Please try again later."
          queryKey={projectKeys.lists()}
        />
      </HomepageLayout>
    );
  }

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  if (projects.length === 0) {
    return (
      <HomepageLayout
        onFilterChange={onFilterChange}
        isLoading={false}
        initialFilters={filters}
        showStats={false}
      >
        <EmptyState
          title="Nothing matches these filters"
          description="Try a different search, or clear the filters to see the whole index."
          icon={HiMiniSquare2Stack}
          className="mb-16"
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      </HomepageLayout>
    );
  }

  return (
    <HomepageLayout
      onFilterChange={onFilterChange}
      isLoading={false}
      initialFilters={filters}
      showStats={false}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm tabular-nums">
          {pagination?.total.toLocaleString("en") ?? projects.length} result
          {(pagination?.total ?? projects.length) === 1 ? "" : "s"}
        </p>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      </div>
      <ProjectGrid projects={projects} />
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          className="mt-10"
          showFirstLast={false}
        />
      )}
    </HomepageLayout>
  );
}

/* ------------------------------------------------------------------------- */
/* Dashboard — the default landing experience                                 */
/* ------------------------------------------------------------------------- */

function Dashboard({
  onFilterChange,
}: {
  onFilterChange: (filters: ProjectFilters) => void;
}) {
  return (
    <HomepageLayout onFilterChange={onFilterChange} showStats>
      <div className="flex flex-col gap-16 md:gap-20">
        <MoversSection />
        <MostUsedModels />
        <RecentResearch />
        <LanguageTiles />
        <ActivityPreview />
      </div>
    </HomepageLayout>
  );
}

/* ------------------------------------------------------------------------- */

export default function HomepageView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Keep discovery hero at the top on full reload and client navigation to `/`. */
  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  const filters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams]
  );

  const isBrowsing = useMemo(
    () => Array.from(searchParams.keys()).length > 0,
    [searchParams]
  );

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const handleFilterChange = (newFilters: ProjectFilters) => {
    const params = filtersToURLParams(newFilters);
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  const handleClear = () => {
    router.replace(pathname, { scroll: false });
  };

  if (isBrowsing) {
    return (
      <BrowseResults
        filters={filters}
        page={page}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />
    );
  }

  return <Dashboard onFilterChange={handleFilterChange} />;
}
