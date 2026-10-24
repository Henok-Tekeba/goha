"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { HiArrowTopRightOnSquare } from "react-icons/hi2";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import { useOrgsQuery } from "../hooks/ecosystem.queries";
import type { OrgRecord } from "../types/ecosystem.types";

const KIND_LABEL = {
  company: "Company",
  lab: "Lab",
  individual: "Builder",
} as const;

function initials(name: string): string {
  return name
    .split(/[\s-_.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function OrgCard({ org }: { org: OrgRecord }) {
  const total =
    org.counts.models +
    org.counts.datasets +
    org.counts.repos +
    org.counts.spaces;
  return (
    <Link
      href={`/orgs/${org.slug}`}
      className="group flex min-w-0 flex-col rounded-[20px] border border-muted-black-stroke px-5 py-4 transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgb(0_0_0/0.05)]"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-secondary font-semibold text-primary text-sm"
          aria-hidden
        >
          {initials(org.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-primary text-sm tracking-tight">
              {org.name}
            </p>
            {org.verified && (
              <span
                className="shrink-0 text-ost-blue-three"
                title="Curated — verified organization"
              >
                ✓
              </span>
            )}
            <HiArrowTopRightOnSquare className="ml-auto hidden size-3.5 shrink-0 text-foreground/20 transition-colors group-hover:text-primary md:block" />
          </div>
          <p className="truncate text-muted-foreground text-xs">
            {KIND_LABEL[org.kind]}
            {org.founded ? ` · since ${org.founded}` : ""}
          </p>
        </div>
      </div>
      {org.desc && (
        <p className="mt-3 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {org.desc}
        </p>
      )}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground/50 tabular-nums">
        {org.counts.models > 0 && <span>{org.counts.models} models</span>}
        {org.counts.datasets > 0 && <span>{org.counts.datasets} datasets</span>}
        {org.counts.repos > 0 && <span>{org.counts.repos} repos</span>}
        {org.counts.spaces > 0 && <span>{org.counts.spaces} spaces</span>}
        {org.downloadsMonthly > 0 && (
          <span className="ml-auto">
            {formatNumberShort(org.downloadsMonthly)}/mo
          </span>
        )}
        {total === 0 && <span className="text-foreground/30">—</span>}
      </div>
    </Link>
  );
}

export default function OrgsGrid() {
  const { data, isLoading, isError } = useOrgsQuery();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<OrgRecord["kind"] | "all">("all");

  const kinds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const org of data ?? [])
      counts.set(org.kind, (counts.get(org.kind) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const filtered = useMemo(() => {
    let list = data ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.desc ?? "").toLowerCase().includes(q)
      );
    }
    if (kind !== "all") list = list.filter((o) => o.kind === kind);
    return list;
  }, [data, query, kind]);

  if (isError)
    return (
      <EmptyState
        title="Couldn't load organizations"
        description="The org index failed to load. Please try again later."
        className="my-16"
      />
    );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organizations…"
          aria-label="Search organizations"
          className="h-9 min-w-0 flex-1 rounded-full border border-muted-black-stroke bg-card px-4 text-primary text-sm outline-none transition-shadow placeholder:text-foreground/30 focus:ring-2 focus:ring-ost-blue-two/40 md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setKind("all")}
            aria-pressed={kind === "all"}
            className={cn(
              "rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs tracking-tight transition-colors",
              kind === "all"
                ? "border-transparent bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            All
          </button>
          {kinds.map(([k, count]) => (
            <button
              key={k}
              type="button"
              onClick={() =>
                setKind(kind === k ? "all" : (k as OrgRecord["kind"]))
              }
              aria-pressed={kind === k}
              className={cn(
                "rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs capitalize tracking-tight transition-colors",
                kind === k
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {k === "individual" ? "Builders" : `${k}s`}{" "}
              <span className="text-foreground/30">{count}</span>
            </button>
          ))}
        </div>
        {!isLoading && (
          <span className="ml-auto text-muted-foreground text-xs tabular-nums">
            {filtered.length} org{filtered.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-muted-black-stroke px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-11 rounded-[12px]" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-1.5 h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No organizations match"
          description="Try clearing the search or filters."
          className="my-16"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((org) => (
            <OrgCard key={org.slug} org={org} />
          ))}
        </div>
      )}
    </div>
  );
}
