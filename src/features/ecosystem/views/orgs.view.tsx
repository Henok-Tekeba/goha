"use client";

import OrgsGrid from "../components/orgs-grid.component";

export default function OrgsView() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Publishers
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Companies, labs and individual publishers with public models,
          datasets, repositories or spaces in the index — plus curated company
          records.
        </p>
      </header>
      <OrgsGrid />
    </div>
  );
}
