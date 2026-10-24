"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { HiMiniSquare2Stack } from "react-icons/hi2";
import { useInView } from "react-intersection-observer";

import EcosystemStatsBand from "@/features/ecosystem/components/ecosystem-stats-band.component";
import MoversSection from "@/features/ecosystem/components/movers-section.component";
import ProjectDiscoveryHero from "@/features/projects/components/project-discovery-hero.component";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import ProjectGrid from "../components/project-grid.component";
import SkeletonProjectGrid from "../components/skeletons/skeleton-project-grid.component";
import { projectKeys } from "../hooks/project.keys";
import { useInfiniteProjectsQuery } from "../hooks/project.queries";
import type { ProjectFilters } from "../types/project-filters.type";

interface HomepageLayoutProps {
  children: React.ReactNode;
  onFilterChange?: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: ProjectFilters;
}

function HomepageLayout({
  children,
  onFilterChange,
  isLoading,
  initialFilters,
}: HomepageLayoutProps) {
  return (
    <>
      <div className="flex flex-col items-center">
        <ProjectDiscoveryHero
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          initialFilters={initialFilters}
        />
        <EcosystemStatsBand />
      </div>
      <div className="mx-6 mb-20 max-w-6xl md:mb-36 lg:mx-auto">
        <div className="mb-14 md:mb-20">
          <MoversSection />
        </div>
        {children}
      </div>
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

  // Validate orderBy
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

/**
 * Converts ProjectFilters to URL search params
 */
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

  const handleFilterChange = (newFilters: ProjectFilters) => {
    const params = filtersToURLParams(newFilters);
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  };

  // Infinite scroll
  const { ref, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProjectsQuery({ ...filters, published: true });

  // Merge all pages of projects
  const projects = data?.pages.flatMap((page) => page.data) || [];

  // Load next page on scroll
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <HomepageLayout
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
        initialFilters={filters}
      >
        <SkeletonProjectGrid />
      </HomepageLayout>
    );
  }

  if (isError) {
    return (
      <HomepageLayout
        onFilterChange={handleFilterChange}
        isLoading={false}
        initialFilters={filters}
      >
        <ErrorState
          message="An error has occurred while loading the projects. Please try again later."
          queryKey={projectKeys.lists()}
        />
      </HomepageLayout>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <HomepageLayout
        onFilterChange={handleFilterChange}
        isLoading={false}
        initialFilters={filters}
      >
        <EmptyState
          title="No projects"
          description="No projects found here."
          icon={HiMiniSquare2Stack}
          className="mb-28"
        />
      </HomepageLayout>
    );
  }

  return (
    <HomepageLayout
      onFilterChange={handleFilterChange}
      isLoading={isLoading}
      initialFilters={filters}
    >
      <ProjectGrid projects={projects} />
      {hasNextPage && (
        <div ref={ref}>
          {isFetchingNextPage ? (
            <div className="my-4 sm:my-5 md:my-6">
              <SkeletonProjectGrid />
            </div>
          ) : (
            <div className="my-12 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                aria-label="Load more projects"
              >
                Load more projects
              </Button>
            </div>
          )}
        </div>
      )}
    </HomepageLayout>
  );
}
