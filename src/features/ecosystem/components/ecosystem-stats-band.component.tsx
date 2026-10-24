"use client";

import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiArrowLongRight } from "react-icons/hi2";
import { Skeleton } from "@/shared/components/ui/skeleton";

import {
  useActivityQuery,
  useEcosystemStatsQuery,
} from "../hooks/ecosystem.queries";

/* Renders only after mount — the relative time depends on the client
   clock and would mismatch the static HTML otherwise. */
function Freshness({ indexedAt }: { indexedAt: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="text-muted-foreground/0">·</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-success"
      />
      <span className="text-muted-foreground">
        Index updated {formatDistanceToNowStrict(new Date(indexedAt))} ago
      </span>
    </span>
  );
}

export default function EcosystemStatsBand() {
  const statsQuery = useEcosystemStatsQuery();
  const activityQuery = useActivityQuery();

  const stats = statsQuery.data;
  const latest = activityQuery.data?.slice(0, 3) ?? [];
  const isLoading = statsQuery.isLoading || activityQuery.isLoading;

  const counts = stats
    ? [
        {
          value: stats.counts.models,
          label: "models",
          href: "/?categories=Model",
        },
        {
          value: stats.counts.datasets,
          label: "datasets",
          href: "/?categories=Dataset",
        },
        { value: stats.counts.papers, label: "papers", href: "/research" },
        { value: stats.counts.orgs, label: "orgs", href: "/orgs" },
        { value: stats.counts.spaces, label: "spaces", href: "/orgs" },
        { value: stats.counts.repos, label: "repos", href: "/orgs" },
        { value: stats.counts.languages, label: "languages", href: "/lang" },
      ]
    : [];

  return (
    <div className="relative z-10 mx-auto -mt-2 mb-10 flex w-full max-w-4xl flex-col items-center gap-3 px-6">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm tabular-nums">
        {isLoading || counts.length === 0
          ? Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20 rounded-md" />
            ))
          : counts.map((count, i) => (
              <span
                key={count.label}
                className="inline-flex items-center gap-2"
              >
                {i > 0 && (
                  <span aria-hidden className="text-black/20">
                    ·
                  </span>
                )}
                <Link
                  href={count.href}
                  className="inline-flex items-baseline gap-1 transition-colors hover:text-ost-blue-three"
                >
                  <span className="font-medium text-primary">
                    {count.value.toLocaleString("en")}
                  </span>
                  <span className="text-muted-foreground">{count.label}</span>
                </Link>
              </span>
            ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-muted-foreground text-xs tracking-tight">
        {stats && <Freshness indexedAt={stats.indexedAt} />}
        {!isLoading && latest.length > 0 && (
          <>
            <span aria-hidden className="hidden text-black/20 sm:inline">
              —
            </span>
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {latest.map((event) => (
                <Link
                  key={event.id}
                  href={
                    event.projectId
                      ? `/projects/${event.projectId}`
                      : "/activity"
                  }
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <span className="max-w-[280px] truncate sm:max-w-none">
                    {event.title}
                  </span>
                  {event.ago && (
                    <span className="text-black/40">{event.ago}</span>
                  )}
                </Link>
              ))}
            </span>
          </>
        )}
      </div>

      <Link
        href="/activity"
        className="group inline-flex items-center gap-1 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
      >
        Everything happening in Ethiopian AI
        <HiArrowLongRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
