"use client";

import { useState, useEffect, useCallback } from "react";
import { isWatched, toggleWatchlist } from "@/lib/watchlist";
import type { WatchItem } from "@/lib/watchlist";

export default function WatchButton({ item }: { item: WatchItem }) {
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setWatched(isWatched(item.id));
  }, [item.id]);

  const handleClick = useCallback(() => {
    const now = toggleWatchlist(item);
    setWatched(now);
  }, [item]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium transition-colors rounded-lg px-3 py-1.5 border"
      style={{
        color: watched ? "var(--star-color, #f59e0b)" : "var(--star-dim, #a3a3a3)",
        backgroundColor: watched ? "var(--star-bg, #fef3c7)" : "transparent",
        borderColor: watched ? "var(--star-border, #fcd34d)" : "var(--neutral-border, #e5e5e5)",
      }}
      aria-label={watched ? "Unwatch" : "Watch"}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={watched ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="hidden sm:inline">{watched ? "Watched" : "Watch"}</span>
    </button>
  );
}
