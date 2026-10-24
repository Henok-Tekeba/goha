"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaArrowTrendUp, FaTrophy } from "react-icons/fa6";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/utils";

import { useActivityQuery } from "../hooks/ecosystem.queries";
import type {
  ActivityEvent,
  ActivityEventType,
} from "../types/ecosystem.types";

const TYPE_FILTERS: { id: ActivityEventType | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "new_model", label: "Models" },
  { id: "new_dataset", label: "Datasets" },
  { id: "new_paper", label: "Research" },
  { id: "trending", label: "Momentum" },
  { id: "milestone", label: "Milestones" },
];

const TYPE_ICON = {
  new_model: "/types/ai.svg",
  new_dataset: "/types/dataset.svg",
  new_paper: "/types/research.svg",
} as const;

function TypeIcon({ event }: { event: ActivityEvent }) {
  if (event.type === "milestone")
    return (
      <span className="flex size-8 items-center justify-center rounded-[10px] border border-muted-black-stroke">
        <FaTrophy className="size-3.5 text-primary" />
      </span>
    );
  if (event.type === "trending")
    return (
      <span className="flex size-8 items-center justify-center rounded-[10px] border border-muted-black-stroke">
        <FaArrowTrendUp className="size-3.5 text-primary" />
      </span>
    );
  return (
    <Image
      src={asset(TYPE_ICON[event.type] ?? "/types/ai.svg")}
      alt=""
      width={32}
      height={32}
      className="size-8 rounded-[10px]"
    />
  );
}

function eventHref(event: ActivityEvent): string {
  return event.projectId ? `/projects/${event.projectId}` : event.url;
}

function isExternal(event: ActivityEvent): boolean {
  return !event.projectId;
}

function EventRow({ event }: { event: ActivityEvent }) {
  const external = isExternal(event);
  return (
    <li className="border-muted-black-stroke border-b last:border-b-0">
      <Link
        href={eventHref(event)}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-start gap-3 px-2 py-3.5 transition-colors hover:bg-secondary/60 md:px-3"
      >
        <TypeIcon event={event} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <p className="font-medium text-primary text-sm tracking-tight group-hover:underline group-hover:decoration-black/20">
              {event.title}
            </p>
            <span className="rounded-full border border-muted-black-stroke px-1.5 py-px text-[10px] text-muted-foreground uppercase tracking-wide">
              {event.label}
            </span>
          </div>
          {event.detail && (
            <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
              {event.detail}
            </p>
          )}
        </div>
        <span className="shrink-0 pt-0.5 text-black/40 text-xs tabular-nums">
          {event.ago}
        </span>
      </Link>
    </li>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

function groupOf(event: ActivityEvent, now: number): string {
  if (!event.at) return "Earlier";
  const ageDays = (now - new Date(event.at).getTime()) / DAY_MS;
  if (ageDays <= 2) return "Last 48 hours";
  if (ageDays <= 7) return "This week";
  if (ageDays <= 31) return "This month";
  return "Earlier";
}

const GROUP_ORDER = ["Last 48 hours", "This week", "This month", "Earlier"];

export default function ActivityFeed({ limit }: { limit?: number }) {
  const { data, isLoading, isError } = useActivityQuery();
  const [filter, setFilter] = useState<ActivityEventType | "all">("all");
  /* Grouping depends on the client clock — render one flat group during
     prerender/hydration, regroup once mounted to avoid mismatches. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const events = useMemo(() => {
    const list = data ?? [];
    return limit ? list.slice(0, limit) : list;
  }, [data, limit]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((event) => event.type === filter),
    [events, filter]
  );

  const groups = useMemo(() => {
    if (!mounted) return [["Recent events", filtered] as const];
    const now = Date.now();
    const map = new Map<string, ActivityEvent[]>();
    for (const event of filtered) {
      const key = groupOf(event, now);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(event);
    }
    return GROUP_ORDER.filter((key) => map.has(key)).map(
      (key) => [key, map.get(key) as ActivityEvent[]] as const
    );
  }, [filtered, mounted]);

  const availableTypes = useMemo(() => {
    const types = new Set((data ?? []).map((event) => event.type));
    return TYPE_FILTERS.filter((f) => f.id === "all" || types.has(f.id));
  }, [data]);

  if (isError)
    return (
      <EmptyState
        title="Couldn't load the feed"
        description="The activity feed failed to load. Please try again later."
        className="my-16"
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1.5">
        {availableTypes.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs tracking-tight transition-colors",
              filter === f.id
                ? "border-transparent bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 rounded-[16px] border border-muted-black-stroke p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-1">
              <Skeleton className="size-8 rounded-[10px]" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-1.5 h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No events for this filter — the ecosystem will catch up."
          className="my-16"
        />
      ) : (
        groups.map(([label, items]) => (
          <section key={label} aria-label={label}>
            <h3 className="mb-2 px-2 font-medium text-black/40 text-xs uppercase tracking-wide md:px-3">
              {label}
            </h3>
            <ul className="rounded-[16px] border border-muted-black-stroke">
              {items.map((event) => (
                <EventRow key={`${event.type}-${event.id}`} event={event} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
