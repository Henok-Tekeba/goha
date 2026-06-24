"use client";

import { useEffect, useState } from "react";
import type { Stats } from "@/types";
import SchemaModal from "./SchemaModal";
import { fetchActivityFeed } from "@/lib/github";

export default function Bottom({ stats }: { stats: Stats }) {
  const [feedCount, setFeedCount] = useState(0);
  const [schemaOpen, setSchemaOpen] = useState(false);

  useEffect(() => {
    fetchActivityFeed()
      .then((d) => {
        const items: any[] = Array.isArray(d) ? d : (d as any)?.data || [];
        setFeedCount(items.length > 0 ? items[0].id || 0 : 0);
      })
      .catch(() => {});
  }, []);

  const ecosystemGrowth = feedCount > 0 ? Math.min(99, Math.round((feedCount / Math.max(stats.models + stats.datasets, 1)) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-neutral-200 dark:bg-neutral-800">
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-6">
        <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Contribute
        </div>
        <div className="text-base sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight leading-tight">
          Know something we don&apos;t?
        </div>
        <div className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
          Open a PR with a single JSON file. Every entry is community-maintained. CI validates
          schema on every submission automatically.
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.open("https://github.com/YOUR_GITHUB_USERNAME/goha.et", "_blank")}
            className="text-sm sm:text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 px-5 sm:px-4 py-2 sm:py-1.5 rounded-full transition-colors"
          >
            Open a PR
          </button>
          <button
            type="button"
            onClick={() => setSchemaOpen(true)}
            className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950 px-5 sm:px-4 py-2 sm:py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all"
          >
            View schema
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-6">
        <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          By the numbers
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-3.5">
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.models}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">models indexed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              <span className="text-emerald-600 dark:text-emerald-400">{stats.languages}</span>
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">languages covered</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.companies}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">active companies</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.research}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">researchers</div>
          </div>
          <div className="col-span-2 border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500">Ecosystem activity</div>
              <div className="flex items-center gap-2">
                {ecosystemGrowth !== 0 && Math.abs(ecosystemGrowth) >= 5 && (
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15V6H9"/><path d="m6 18 9-9"/></svg>
                    {ecosystemGrowth}% growth
                  </span>
                )}
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">{feedCount} events tracked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SchemaModal open={schemaOpen} onClose={() => setSchemaOpen(false)} />
    </div>
  );
}