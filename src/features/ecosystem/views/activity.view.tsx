"use client";

import ActivityPulseChart from "@/features/ecosystem/components/charts/activity-pulse-chart";

import ActivityFeed from "../components/activity-feed.component";
import type { ActivityEvent } from "../types/ecosystem.types";

export default function ActivityView({
  events,
  builtAt,
}: {
  events: ActivityEvent[];
  builtAt: string;
}) {
  const builtDate = new Date(builtAt).toISOString().slice(0, 10);
  return (
    <div className="mx-auto max-w-3xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Today in Ethiopian AI
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Recent model, dataset, paper and milestone events the daily scrape
          picks up across Hugging Face and arXiv — a rolling feed of what the
          index saw, not a complete inventory.
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          Feed built {builtDate} · relative times are measured from that
          snapshot.
        </p>
        <div className="mt-6 rounded-[20px] border border-muted-black-stroke px-4 py-4">
          <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            Last 30 days
          </p>
          <ActivityPulseChart
            events={events}
            builtAt={builtAt}
            className="h-40 w-full md:h-44"
          />
        </div>
      </header>
      <ActivityFeed events={events} builtAt={builtAt} />
    </div>
  );
}
