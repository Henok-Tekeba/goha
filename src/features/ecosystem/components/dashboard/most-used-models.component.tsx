"use client";

import Link from "next/link";
import { useMemo } from "react";

import ProjectGrid from "@/features/projects/components/project-grid.component";
import { useProjectsQuery } from "@/features/projects/hooks/project.queries";
import { Skeleton } from "@/shared/components/ui/skeleton";

const COUNT = 6;

export default function MostUsedModels() {
  const { data, isLoading } = useProjectsQuery({
    categories: "Model",
    per_page: 250,
  });

  const models = useMemo(() => {
    const list = data?.data ?? [];
    return [...list]
      .sort((a, b) => (b.downloadsMonthly ?? 0) - (a.downloadsMonthly ?? 0))
      .slice(0, COUNT);
  }, [data]);

  return (
    <section aria-labelledby="most-used-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2
            id="most-used-heading"
            className="text-lg text-primary tracking-[-0.03em] md:text-xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Most used models
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            The models the community actually downloads.
          </p>
        </div>
        <Link
          href="/?categories=Model"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          Browse all 190 models →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: COUNT }).map((_, i) => (
            <div
              key={i}
              className="rounded-[18px] border border-muted-black-stroke px-5 py-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-[10px]" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-1.5 h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="mt-4 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <ProjectGrid
          projects={models}
          className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
        />
      )}
    </section>
  );
}
