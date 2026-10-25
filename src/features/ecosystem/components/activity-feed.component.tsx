"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FaArrowTrendUp, FaTrophy } from "react-icons/fa6";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { asset } from "@/shared/lib/asset";
import { cn } from "@/shared/lib/utils";

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
  const when = event.ago ?? (event.at ? event.at.slice(0, 10) : "");
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
        <span className="shrink-0 pt-0.5 text-muted-foreground text-xs tabular-nums">
          {when}
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

export default function ActivityFeed({
  events,
  builtAt,
  limit,
}: {
  events: ActivityEvent[];
  builtAt: string;
  limit?: number;
}) {
  const [filter, setFilter] = useState<ActivityEventType | "all">("all");

  const visible = useMemo(
    () => (limit ? events.slice(0, limit) : events),
    [events, limit]
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? visible
        : visible.filter((event) => event.type === filter),
    [visible, filter]
  );

  const groups = useMemo(() => {
    const now = new Date(builtAt).getTime();
    const map = new Map<string, ActivityEvent[]>();
    for (const event of filtered) {
      const key = groupOf(event, now);
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(event);
    }
    return GROUP_ORDER.filter((key) => map.has(key)).map(
      (key) => [key, map.get(key) as ActivityEvent[]] as const
    );
  }, [filtered, builtAt]);

  const availableTypes = useMemo(() => {
    const types = new Set(events.map((event) => event.type));
    return TYPE_FILTERS.filter((f) => f.id === "all" || types.has(f.id));
  }, [events]);

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

      {groups.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No events for this filter — the ecosystem will catch up."
          className="my-16"
        />
      ) : (
        groups.map(([label, items]) => (
          <section key={label} aria-label={label}>
            <h2 className="mb-2 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wide md:px-3">
              {label}
            </h2>
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
