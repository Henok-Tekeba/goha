"use client";

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
      </header>
      <ActivityFeed />
    </div>
  );
}
