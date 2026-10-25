import Link from "next/link";

import type { EcosystemStats } from "../types/ecosystem.types";
import Freshness from "./freshness.component";

export default function EcosystemStatsBand({
  stats,
}: {
  stats: EcosystemStats;
}) {
  const counts = [
    {
      value: stats.counts.models,
      label: "models",
      href: "/?categories=Model",
    },
    {
      value: stats.counts.datasets,
      label: "datasets",
      href: "/?categories=Dataset",
    },
    { value: stats.counts.papers, label: "papers", href: "/research" },
    { value: stats.counts.orgs, label: "orgs", href: "/orgs" },
  ];

  return (
    <div className="mx-auto mb-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 px-6 text-sm">
      {counts.map((count, i) => (
        <span key={count.label} className="inline-flex items-center gap-2.5">
          {i > 0 && (
            <span aria-hidden className="text-black/20">
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
      <span aria-hidden className="text-black/20">
        —
      </span>
      <Freshness indexedAt={stats.indexedAt} />
    </div>
  );
}
