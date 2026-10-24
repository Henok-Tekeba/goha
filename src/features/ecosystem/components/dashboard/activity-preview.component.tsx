"use client";

import Link from "next/link";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { useActivityQuery } from "../../hooks/ecosystem.queries";

export default function ActivityPreview() {
  const { data, isLoading } = useActivityQuery();
  const events = (data ?? []).slice(0, 5);

  return (
    <section aria-labelledby="activity-preview-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="activity-preview-heading"
          className="text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Today in Ethiopian AI
        </h2>
        <Link
          href="/activity"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          Full feed →
        </Link>
      </div>

      <ul className="rounded-[16px] border border-muted-black-stroke bg-card">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li
                key={i}
                className="border-muted-black-stroke border-b px-5 py-3 last:border-b-0"
              >
                <Skeleton className="h-4 w-2/3" />
              </li>
            ))
          : events.map((event) => (
              <li
                key={`${event.type}-${event.id}`}
                className="border-muted-black-stroke border-b last:border-b-0"
              >
                <Link
                  href={
                    event.projectId
                      ? `/projects/${event.projectId}`
                      : event.url || "/activity"
                  }
                  className="flex items-baseline justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60"
                >
                  <span className="truncate text-[13px] text-primary">
                    {event.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {event.ago}
                  </span>
                </Link>
              </li>
            ))}
      </ul>
    </section>
  );
}
