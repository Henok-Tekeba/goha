"use client";

import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { useEcosystemStatsQuery } from "../hooks/ecosystem.queries";

/* Renders only after mount — the relative time depends on the client
   clock and would mismatch the static HTML otherwise. */
function Freshness({ indexedAt }: { indexedAt: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-success"
      />
      <span className="text-muted-foreground">
        updated {formatDistanceToNowStrict(new Date(indexedAt))} ago
      </span>
    </span>
  );
}

export default function EcosystemStatsBand() {
  const { data, isLoading } = useEcosystemStatsQuery();

  const counts = data
    ? [
        {
          value: data.counts.models,
          label: "models",
          href: "/?categories=Model",
        },
        {
          value: data.counts.datasets,
          label: "datasets",
          href: "/?categories=Dataset",
        },
        { value: data.counts.papers, label: "papers", href: "/research" },
        { value: data.counts.orgs, label: "orgs", href: "/orgs" },
      ]
    : [];

  return (
    <div className="mx-auto mb-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 px-6 text-sm">
      {isLoading || !data ? (
        <Skeleton className="h-4 w-64 rounded-md" />
      ) : (
        <>
          {counts.map((count, i) => (
            <span
              key={count.label}
              className="inline-flex items-center gap-2.5"
            >
              {i > 0 && (
                <span aria-hidden className="text-foreground/20">
                  ·
                </span>
              )}
              <Link
                href={count.href}
                className="inline-flex items-baseline gap-1 transition-colors hover:text-ost-blue-three"
              >
                <span className="font-medium text-primary tabular-nums">
                  {count.value.toLocaleString("en")}
                </span>
                <span className="text-muted-foreground">{count.label}</span>
              </Link>
            </span>
          ))}
          <span aria-hidden className="text-foreground/20">
            —
          </span>
          <Freshness indexedAt={data.indexedAt} />
        </>
      )}
    </div>
  );
}
