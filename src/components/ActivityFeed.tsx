"use client";

import { useEffect, useState } from "react";
import { Bot, Table, FileText, TrendingUp, Trophy, Bell } from "lucide-react";
import type { ActivityItem } from "@/types";
import { fetchActivityFeed } from "@/lib/github";

const FEED_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  new_model: Bot,
  new_dataset: Table,
  new_paper: FileText,
  trending: TrendingUp,
  milestone: Trophy,
};

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityFeed()
      .then((d: any) => setItems((Array.isArray(d) ? d : d?.data || []).slice(0, 6)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2 px-4 sm:px-6 py-3 bg-[#fafafa] dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
        {[1,2,3,4].map((i) => (
          <span key={i} className="skeleton inline-block h-7 w-44 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-[#fafafa] dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto no-scrollbar">
      <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider whitespace-nowrap shrink-0 mr-1">
        Latest
      </span>
      {items.map((item, i) => {
        const Icon = FEED_ICONS[item.type] || Bell;
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full px-2.5 sm:px-3 py-1.5 sm:py-1 whitespace-nowrap shrink-0"
          >
            <Icon size={12} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[280px]">{item.message}</span>
            <span className="text-[#c4c4c4]">&middot; {item.ago}</span>
          </span>
        );
      })}
    </div>
  );
}
