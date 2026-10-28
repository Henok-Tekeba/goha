"use client";

import Link from "next/link";

import HeroBadge from "@/shared/components/ui/hero-badge";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";

import type { ProjectFilters } from "../types/project-filters.type";
import FilterSearchBar from "./filter-search-bar.component";

/** Gap between each element starting. Keep it short: the hero is above the
    fold, so a long cascade reads as a slow page. */
const STAGGER = 60;
const DURATION = "320ms";

interface DiscoveryHeroIntroProps {
  onFilterChange?: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: ProjectFilters;
}

/* The hero must be visible on first paint. A JS-driven reveal (opacity: 0
   until hydration) makes the most important content appear last, so the
   entrance is a plain CSS animation instead — it runs before React loads. */
export function DiscoveryHeroIntro({
  onFilterChange,
  isLoading,
  initialFilters,
}: DiscoveryHeroIntroProps) {
  return (
    <>
      {/* 1 — badge */}
      <div
        className="hero-reveal"
        style={{ animationDelay: "0ms", animationDuration: DURATION }}
      >
        <HeroBadge
          className="mb-3"
          pillLabel="GitHub"
          description="Help support the founding team"
          href={EXTERNAL_LINKS.GITHUB_REPO}
        />
      </div>

      {/* 2 + 3 — headline lines */}
      <h1
        className="mt-3 text-center text-4xl leading-none tracking-[-0.04em] md:text-5xl"
        style={{ fontFamily: "Aspekta", fontWeight: 500 }}
      >
        <span
          className="hero-reveal block"
          style={{
            animationDelay: `${STAGGER}ms`,
            animationDuration: DURATION,
          }}
        >
          An open index of
        </span>
        <span
          className="hero-reveal block"
          style={{
            animationDelay: `${STAGGER * 2}ms`,
            animationDuration: DURATION,
          }}
        >
          Ethiopian AI
        </span>
      </h1>

      {/* 4 — subtitle */}
      <div
        className="hero-reveal"
        style={{
          animationDelay: `${STAGGER * 3}ms`,
          animationDuration: DURATION,
        }}
      >
        <p className="mt-5 max-w-[450px] px-2 text-center text-neutral-950 text-sm">
          A live index of models, datasets, companies and research for Ethiopian
          languages — find, compare and explore the ecosystem.
        </p>
      </div>

      {/* 5 — filter bar */}
      <div
        className="hero-reveal mt-8 w-full px-6 md:w-auto"
        style={{
          animationDelay: `${STAGGER * 4}ms`,
          animationDuration: DURATION,
        }}
      >
        <FilterSearchBar
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          initialFilters={initialFilters}
        />
      </div>

      {/* 6 — plain-language search */}
      <p
        className="hero-reveal mt-4 px-6 text-center text-muted-foreground text-xs"
        style={{
          animationDelay: `${STAGGER * 5}ms`,
          animationDuration: DURATION,
        }}
      >
        or ask in plain language —{" "}
        <Link
          href="/ask"
          className="underline underline-offset-4 transition-colors hover:text-primary"
        >
          Ask Goha
        </Link>
      </p>
    </>
  );
}
