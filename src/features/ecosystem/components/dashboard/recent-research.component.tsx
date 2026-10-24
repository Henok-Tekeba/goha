"use client";

import Link from "next/link";

import { Skeleton } from "@/shared/components/ui/skeleton";

import { usePapersQuery } from "../../hooks/ecosystem.queries";
import { PaperRow } from "../papers-list.component";

export default function RecentResearch() {
  const { data, isLoading } = usePapersQuery();
  const papers = (data ?? []).slice(0, 4);

  return (
    <section aria-labelledby="recent-research-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2
            id="recent-research-heading"
            className="text-lg text-primary tracking-[-0.03em] md:text-xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Latest research
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            New papers on Ethiopian languages, swept from arXiv.
          </p>
        </div>
        <Link
          href="/research"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          Research hub →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] border border-muted-black-stroke px-5 py-4"
            >
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {papers.map((paper) => (
            <PaperRow key={paper.slug} paper={paper} />
          ))}
        </div>
      )}
    </section>
  );
}
