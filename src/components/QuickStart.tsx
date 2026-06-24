"use client";

import { useEffect, useState } from "react";
import { fetchQuickstart } from "@/lib/github";

function fmt(n: number | null | undefined) {
  if (n == null) return "";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

const GUIDE_BADGE: Record<string, string> = {
  "b-asr": "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  "b-llm": "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  "b-emb": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
};

export default function QuickStart() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickstart()
      .then((d) => setData(d || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data?.guides?.length) return null;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Start here</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {data.guides.map((guide: any) => (
          <div key={guide.id} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">{guide.title}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3">{guide.description}</div>
            <div className="space-y-1.5">
              {guide.items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${GUIDE_BADGE[item.bc] ?? GUIDE_BADGE["b-emb"]}`}>{item.badge}</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate flex-1">{item.name}</span>
                  {item.dl != null && (
                    <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">{fmt(item.dl)}/mo</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}