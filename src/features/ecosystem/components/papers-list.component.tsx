"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HiArrowTopRightOnSquare, HiMagnifyingGlass } from "react-icons/hi2";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import { usePapersQuery } from "../hooks/ecosystem.queries";
import type { PaperRecord } from "../types/ecosystem.types";

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs tracking-tight transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

export function PaperRow({ paper }: { paper: PaperRecord }) {
  const [expanded, setExpanded] = useState(false);
  const detailHref = paper.projectId
    ? `/projects/${paper.projectId}`
    : paper.url;
  const authors =
    paper.authors.length > 3
      ? `${paper.authors.slice(0, 3).join(", ")} +${paper.authors.length - 3} more`
      : paper.authors.join(", ");

  return (
    <article className="rounded-[16px] border border-muted-black-stroke px-5 py-4 transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgb(0_0_0/0.05)]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-medium text-primary text-sm tracking-tight md:text-base">
          {detailHref ? (
            <Link
              href={detailHref}
              className="hover:underline hover:decoration-foreground/20"
            >
              {paper.title}
            </Link>
          ) : (
            paper.title
          )}
        </h3>
        <div className="flex items-center gap-2 text-foreground/40 text-xs tabular-nums">
          {paper.year && <span>{paper.year}</span>}
          {paper.arxivId && (
            <span className="hidden sm:inline">
              arXiv:{paper.arxivId.replace(/v\d+$/, "")}
            </span>
          )}
        </div>
      </div>

      {authors && (
        <p className="mt-1 text-muted-foreground text-xs">{authors}</p>
      )}

      {paper.abstract && (
        <p
          className={cn(
            "mt-2.5 text-muted-foreground text-sm leading-relaxed",
            !expanded && "line-clamp-3"
          )}
        >
          {paper.abstract}
        </p>
      )}
      {paper.abstract && paper.abstract.length > 260 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-foreground/40 text-xs transition-colors hover:text-primary"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {paper.languages.slice(0, 4).map((lang) => (
          <span
            key={lang}
            className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-foreground/60"
          >
            {lang}
          </span>
        ))}
        {paper.tasks.slice(0, 3).map((task) => (
          <span
            key={task}
            className="rounded-full border border-muted-black-stroke px-2 py-0.5 text-[11px] text-foreground/60"
          >
            {task}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3">
          {paper.projectId && (
            <Link
              href={`/projects/${paper.projectId}`}
              className="text-foreground/40 text-xs transition-colors hover:text-primary"
            >
              Full record →
            </Link>
          )}
          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-foreground/40 text-xs transition-colors hover:text-primary"
            >
              arXiv
              <HiArrowTopRightOnSquare className="size-3" />
            </a>
          )}
        </span>
      </div>
    </article>
  );
}

type SortKey = "newest" | "oldest" | "title";

export default function PapersList() {
  const { data, isLoading, isError } = usePapersQuery();
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const paper of data ?? [])
      for (const lang of paper.languages)
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [data]);

  const tasks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const paper of data ?? [])
      for (const t of paper.tasks) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          (p.abstract ?? "").toLowerCase().includes(q)
      );
    }
    if (language) list = list.filter((p) => p.languages.includes(language));
    if (task) list = list.filter((p) => p.tasks.includes(task));
    list = [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const ta = a.published ? new Date(a.published).getTime() : 0;
      const tb = b.published ? new Date(b.published).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [data, query, language, task, sort]);

  const hasFilters = !!query.trim() || language || task;

  if (isError)
    return (
      <EmptyState
        title="Couldn't load research"
        description="The paper index failed to load. Please try again later."
        className="my-16"
      />
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-0 flex-1 md:max-w-sm">
            <HiMagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/30" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, authors, abstracts…"
              className="rounded-full bg-card pl-9"
              aria-label="Search research papers"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort papers"
            className="rounded-full border border-muted-black-stroke bg-card px-3 py-2 text-muted-foreground text-xs tracking-tight"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">A → Z</option>
          </select>
          {!isLoading && (
            <span className="ml-auto text-muted-foreground text-xs tabular-nums">
              {filtered.length} paper{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {languages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {languages.map(([name, count]) => (
              <Chip
                key={name}
                active={language === name}
                onClick={() => setLanguage(language === name ? null : name)}
              >
                {name} <span className="text-foreground/30">{count}</span>
              </Chip>
            ))}
          </div>
        )}
        {tasks.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {tasks.map(([name, count]) => (
              <Chip
                key={name}
                active={task === name}
                onClick={() => setTask(task === name ? null : name)}
              >
                {name} <span className="text-foreground/30">{count}</span>
              </Chip>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] border border-muted-black-stroke px-5 py-4"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No papers match" : "No research indexed yet"}
          description={
            hasFilters
              ? "Try clearing the search or filters."
              : "The arXiv sweep hasn't picked anything up yet."
          }
          className="my-16"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((paper) => (
            <PaperRow key={paper.slug} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
