"use client";

import type { Tab } from "@/types";

const tabs: { key: Tab; label: string }[] = [
  { key: "models", label: "Models" },
  { key: "datasets", label: "Datasets" },
  { key: "companies", label: "Companies" },
  { key: "research", label: "Research" },
];

export default function TabsBar({
  activeTab,
  counts,
  onTabChange,
}: {
  activeTab: Tab;
  counts: Record<string, number>;
  onTabChange: (tab: Tab) => void;
}) {
  const total = counts[activeTab] ?? 0;
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-0">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`text-sm sm:text-xs px-3.5 sm:px-3 py-3 sm:py-[13px] border-b-2 sm:border-b-[1.5px] transition-all whitespace-nowrap capitalize ${
              activeTab === key
                ? "text-neutral-900 dark:text-neutral-100 border-b-neutral-900 dark:border-b-neutral-100 font-medium"
                : "text-neutral-400 dark:text-neutral-500 border-b-transparent hover:text-neutral-600 dark:hover:text-neutral-300"
            }`}
          >
            {label}{" "}
            <span
              className={`inline-block text-[10px] sm:text-[9px] font-mono rounded-full px-1.5 sm:px-1 py-0.5 ml-1 ${
                activeTab === key
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {counts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>
      <div className="hidden sm:block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0 ml-3">
        {total} result{total !== 1 ? "s" : ""}
      </div>
    </div>
  );
}