"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  getLanguageCoverage,
  getLanguages,
} from "@/shared/lib/local-data.client";

function useLanguagesData() {
  return useQuery({
    queryKey: ["ecosystem", "languages-tiles"],
    queryFn: () => Promise.all([getLanguages(), getLanguageCoverage()]),
  });
}

export default function LanguageTiles() {
  const { data, isLoading } = useLanguagesData();
  const [languages, coverage] = data ?? [[], null];

  const totals = new Map<string, number>();
  for (const row of coverage?.rows ?? []) {
    for (const [key, value] of Object.entries(row)) {
      if (key === "task" || typeof value !== "number") continue;
      totals.set(key, (totals.get(key) ?? 0) + value);
    }
  }

  const tiles = languages
    .map((language) => ({
      ...language,
      total: totals.get(language.name) ?? 0,
    }))
    .filter((tile) => tile.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <section aria-labelledby="languages-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="languages-heading"
          className="text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Browse by language
        </h2>
        <Link
          href="/lang"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          All languages →
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-[16px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.slug}
              href={`/lang/${tile.slug}`}
              className="flex items-center gap-3 rounded-[16px] border border-muted-black-stroke bg-white px-4 py-3.5 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-14px_rgb(0_0_0/0.14)]"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-muted-black-stroke text-base text-primary"
                style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
                aria-hidden
              >
                {tile.glyph}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-[13px] text-primary">
                  {tile.name}
                </span>
                <span className="block text-[11px] text-muted-foreground tabular-nums">
                  {tile.total} assets
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
