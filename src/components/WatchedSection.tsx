"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWatchlist } from "@/lib/watchlist";
import type { WatchItem } from "@/lib/watchlist";

export default function WatchedSection({ allModels }: { allModels: any[] }) {
  const [watched, setWatched] = useState<WatchItem[]>([]);

  useEffect(() => {
    setWatched(getWatchlist());
  }, []);

  const items = watched
    .map((w) => {
      const match = allModels.find((m: any) => (m.id || m.name) === w.id);
      return match ? { watch: w, data: match } : null;
    })
    .filter(Boolean) as { watch: WatchItem; data: any }[];

  if (items.length === 0) return null;

  return (
    <div className="px-5 sm:px-6 py-4">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
        Watched models ({items.length})
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.slice(0, 6).map(({ watch, data }) => (
          <Link
            key={watch.id}
            href={`/models/${watch.id}`}
            className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full border text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                {data.badge || watch.badge || "Model"}
              </span>
              {data.growth != null && Math.abs(data.growth) >= 5 && (
                <span className={`font-mono text-[9px] ${data.growth > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {data.growth > 0 ? "↑" : "↓"} {Math.abs(data.growth)}%
                </span>
              )}
            </div>
            <div className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">{data.name || watch.name}</div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{watch.org}</div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
              {data.dl != null ? `${data.dl.toLocaleString()} downloads/mo` : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
