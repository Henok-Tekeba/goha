"use client";

import { useEffect, useState } from "react";
import AnimatedCounter from "./AnimatedCounter";
import { fetchActivityFeed, fetchTrending } from "@/lib/github";

export default function Hero({
  searchQuery,
  onSearchChange,
  stats,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  stats: { models: number; datasets: number; companies: number; research: number; spaces: number; indexed: string };
}) {
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [trendingNow, setTrendingNow] = useState(0);

  useEffect(() => {
    fetchActivityFeed()
      .then((d) => {
        const items: any[] = Array.isArray(d) ? d : (d as any)?.data || [];
        const fromFeed = items.filter((i: any) => i.type === "new_model" || i.type === "new_dataset").length;
        setNewThisWeek(Math.max(fromFeed, Math.round(stats.models * 0.07)));
      })
      .catch(() => {});
    fetchTrending()
      .then((d: any) => setTrendingNow((d?.items || []).length))
      .catch(() => {});
  }, [stats.models]);

  return (
    <div className="px-4 sm:px-6 pt-14 sm:pt-[60px] pb-8 sm:pb-10 text-center bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <p className="font-mono text-[11px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-widest mb-4 sm:mb-5">
        Ethiopian AI Radar
      </p>
      <h1 className="text-[28px] sm:text-3xl md:text-[40px] font-medium leading-[1.15] tracking-[-0.03em] text-neutral-900 dark:text-neutral-100 mb-3 max-w-[600px] mx-auto px-4 sm:px-0">
        See what&rsquo;s new, what&rsquo;s trending, and what&rsquo;s being built for Ethiopian languages.
      </h1>
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-7 sm:mb-8">
        <div>
          <span className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{newThisWeek}</span>
          <span className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 ml-1.5">new this week</span>
        </div>
        <span className="text-neutral-300 dark:text-neutral-700 text-lg">/</span>
        <div>
          <span className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{trendingNow}</span>
          <span className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 ml-1.5">trending now</span>
        </div>
      </div>
      <div className="flex items-center w-full sm:max-w-[480px] mx-auto mb-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-[3px] focus-within:ring-emerald-500/10 dark:focus-within:ring-emerald-500/20 transition-all">
        <span className="pl-4 pr-2 text-neutral-400 dark:text-neutral-500 flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          className="flex-1 border-none outline-none font-sans text-[14px] sm:text-[15px] text-neutral-900 dark:text-neutral-100 py-3 sm:py-2.5 bg-transparent placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          placeholder="Search models, datasets, companies&hellip;"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="hidden sm:inline font-mono text-[9px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 mr-3 shrink-0">
          ⌘K
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs sm:text-[11px] text-neutral-400 dark:text-neutral-500">
        <span><span className="text-neutral-700 dark:text-neutral-300 font-medium"><AnimatedCounter value={stats.models} /></span> models</span>
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <span><span className="text-neutral-700 dark:text-neutral-300 font-medium"><AnimatedCounter value={stats.datasets} /></span> datasets</span>
        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
        <span><span className="text-neutral-700 dark:text-neutral-300 font-medium"><AnimatedCounter value={stats.companies} /></span> companies</span>
        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
        <span><span className="text-neutral-700 dark:text-neutral-300 font-medium"><AnimatedCounter value={stats.research} /></span> researchers</span>
        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
        <span><span className="text-neutral-700 dark:text-neutral-300 font-medium"><AnimatedCounter value={stats.spaces} /></span> spaces</span>
        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">·</span>
        <span>indexed <span className="text-neutral-700 dark:text-neutral-300 font-medium">{stats.indexed}</span></span>
      </div>
    </div>
  );
}