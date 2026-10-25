"use client";

import OrgsGrid from "../components/orgs-grid.component";
import type { OrgRecord } from "../types/ecosystem.types";

export default function OrgsView({ orgs }: { orgs: OrgRecord[] }) {
  const curated = orgs.filter((org) => org.verified).length;
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
        <p className="mt-2 max-w-2xl text-muted-foreground text-xs leading-relaxed">
          A ✓ marks a record curated by goha ({curated} of {orgs.length}), not
          an external certification. Most profiles list only the assets the
          index can attribute; missing links mean none were published or found.
        </p>
      </header>
      <OrgsGrid orgs={orgs} />
    </div>
  );
}
