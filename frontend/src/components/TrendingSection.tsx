"use client";

import { useEffect, useState } from "react";
import type { TrendingItem } from "@/types";
import Sparkline from "./Sparkline";
import { fetchTrending } from "@/lib/github";

function fmt(n: number | null | undefined) {
  if (n == null) return "";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

export default function TrendingSection() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [label, setLabel] = useState<string>("Most Downloaded This Week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending()
      .then((d) => {
        setItems(d?.items || []);
        if (d?.label) setLabel(d.label);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{label}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 min-w-0 w-full">
              <div className="skeleton h-5 w-16 rounded-full mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2 mb-3" />
              <div className="skeleton h-10 w-full mb-2" />
              <div className="flex justify-between items-center">
                <div className="skeleton h-4 w-10 rounded-full" />
                <div className="skeleton h-3 w-14" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || !items.length) return null;

  return (
    <div className="px-4 sm:px-6 py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 mb-3">
        Growth trends available after 7 days of data
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 hover:shadow-[0_4px_14px_rgba(0,0,0,.06)] hover:border-[#d4d4d4] transition-all cursor-pointer min-w-0 w-full"
          >
            <div className="flex items-start justify-between mb-2.5">
              <span className="font-mono text-[10px] font-medium text-[#7c3aed] bg-[#faf5ff] border border-[#ddd6fe] px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            </div>
            <div className="text-[15px] font-medium text-neutral-900 dark:text-neutral-100 mb-0.5 tracking-tight">
              {item.name}
            </div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mb-3">{item.org}</div>
            <div className="mb-3 flex justify-center">
                <Sparkline sparkline={(item as any).sparkline} width={120} height={40} fill />
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">{item.desc}</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-[#525252] bg-[#f4f4f5] border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
                {item.lang || "\u2014"}
              </span>
              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                {fmt(item.dl)} /mo
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
