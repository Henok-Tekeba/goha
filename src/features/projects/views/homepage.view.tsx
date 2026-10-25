"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useLayoutEffect, useMemo } from "react";
import { HiMiniSquare2Stack } from "react-icons/hi2";

import { Button } from "@/shared/components/ui/button";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination.component";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";

import ProjectDiscoveryHero from "../components/project-discovery-hero.component";
import ProjectGrid from "../components/project-grid.component";
import SkeletonProjectGrid from "../components/skeletons/skeleton-project-grid.component";
import { projectKeys } from "../hooks/project.keys";
import { useProjectsQuery } from "../hooks/project.queries";
import {
  filtersToURLParams,
  parseFiltersFromURL,
} from "../lib/project-filters-url";
import type { ProjectFilters } from "../types/project-filters.type";

const PAGE_SIZE = 12;

/* Query params that mean "show browse results". Tracking params such as
   ?ref=telegram must not replace the dashboard. */
const BROWSE_PARAMS = [
  "categories",
  "techStacks",
  "orderBy",
  "orderDirection",
  "page",
] as const;

interface BrowseLayoutProps {
  children: ReactNode;
  onFilterChange?: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: ProjectFilters;
}

function BrowseLayout({
  children,
  onFilterChange,
  isLoading,
  initialFilters,
}: BrowseLayoutProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <ProjectDiscoveryHero
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          initialFilters={initialFilters}
        />
      </div>
      <div className="mx-6 mb-20 max-w-6xl md:mb-36 lg:mx-auto">{children}</div>
    </>
  );
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
      <BrowseLayout
        onFilterChange={onFilterChange}
        isLoading
        initialFilters={filters}
      >
        <SkeletonProjectGrid />
      </BrowseLayout>
    );
  }

  if (isError) {
    return (
      <BrowseLayout
        onFilterChange={onFilterChange}
        isLoading={false}
        initialFilters={filters}
      >
        <ErrorState
          message="An error has occurred while loading the projects. Please try again later."
          queryKey={projectKeys.lists()}
        />
      </BrowseLayout>
    );
  }

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  if (projects.length === 0) {
    return (
      <BrowseLayout
        onFilterChange={onFilterChange}
        isLoading={false}
        initialFilters={filters}
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
      </BrowseLayout>
    );
  }

  return (
    <BrowseLayout
      onFilterChange={onFilterChange}
      isLoading={false}
      initialFilters={filters}
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
    </BrowseLayout>
  );
}

/* ------------------------------------------------------------------------- */
/* Mode switch — dashboard by default, client-rendered browse for filters     */
/* ------------------------------------------------------------------------- */

function HomepageMode({ dashboard }: { dashboard: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams]
  );

  const isBrowsing = useMemo(
    () => BROWSE_PARAMS.some((key) => searchParams.has(key)),
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

  return <>{dashboard}</>;
}

export default function HomepageView({ dashboard }: { dashboard: ReactNode }) {
  /** Keep discovery hero at the top on full reload and client navigation to `/`. */
  useLayoutEffect(() => {
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      history.scrollRestoration = previousRestoration;
    };
  }, []);

  /* The prerendered dashboard doubles as the fallback: `useSearchParams`
     bails out of static rendering, so without it the HTML would only have
     skeletons. On the client the same dashboard is reused when no filters
     are active. */
  return (
    <Suspense fallback={dashboard}>
      <HomepageMode dashboard={dashboard} />
    </Suspense>
  );
}
