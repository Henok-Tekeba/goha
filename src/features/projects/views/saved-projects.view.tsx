"use client";

import { useMemo } from "react";
import { HiOutlineBookmark } from "react-icons/hi2";

import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useLocalBookmarks } from "@/shared/hooks/use-local-bookmarks.hook";

import ProjectGrid from "../components/project-grid.component";
import { useProjectsQuery } from "../hooks/project.queries";

export default function SavedProjectsView() {
  const { ids, ready } = useLocalBookmarks();
  const { data, isLoading } = useProjectsQuery({
    published: true,
    per_page: 1000,
  });

  const savedProjects = useMemo(() => {
    if (!data?.data) return [];
    const saved = new Set(ids);
    return data.data.filter(
      (project): project is typeof project & { id: string } => {
        if (!project.id) return false;
        return saved.has(project.id);
      }
    );
  }, [data?.data, ids]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-10 md:py-16">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-[0.14em]">
          Your watchlist
        </p>
        <h1 className="font-medium text-3xl tracking-tight">Saved projects</h1>
        <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
          Saved locally in this browser — no account needed, and nothing leaves
          your device. Use the bookmark button on any project to add or remove
          it here.
        </p>
      </div>

      {!ready || isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6.5">
          <Skeleton className="h-48 rounded-[22px]" />
          <Skeleton className="h-48 rounded-[22px]" />
        </div>
      ) : savedProjects.length > 0 ? (
        <ProjectGrid projects={savedProjects} />
      ) : (
        <EmptyState
          title="Nothing saved yet"
          description="Browse the index and tap the bookmark button on a model, dataset or paper to keep it here."
          icon={HiOutlineBookmark}
          href="/"
          buttonText="Browse projects"
        />
      )}
    </main>
  );
}
