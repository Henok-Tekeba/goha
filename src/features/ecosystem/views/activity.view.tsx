"use client";

import ActivityPulseChart from "@/features/ecosystem/components/charts/activity-pulse-chart";

import ActivityFeed from "../components/activity-feed.component";

export default function ActivityView() {
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
          Every new model, dataset, paper and milestone the daily scrape picks
          up across Hugging Face, GitHub and arXiv — the ecosystem as it
          happens, not a quarterly report.
        </p>
        <div className="mt-6 rounded-[20px] border border-muted-black-stroke px-4 py-4">
          <p className="mb-2 font-medium text-foreground/40 text-xs uppercase tracking-wide">
            Last 30 days
          </p>
          <ActivityPulseChart className="h-40 w-full md:h-44" />
        </div>
      </header>
      <ActivityFeed />
    </div>
  );
}
