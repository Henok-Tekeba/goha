"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/types";
import { fetchModels } from "@/lib/github";

type TaskKey = "b-asr" | "b-nmt" | "b-emb" | "b-llm" | "b-ner";

const TASKS: { key: TaskKey; label: string; verdict: string; badgeClass: string; badgeBg: string; badgeBorder: string; badgeText: string }[] = [
  {
    key: "b-asr",
    label: "ASR",
    verdict: "Most downloaded ASR model for Amharic",
    badgeClass: "b-asr",
    badgeBg: "bg-emerald-600 dark:bg-emerald-500 ",
    badgeBorder: "border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "b-nmt",
    label: "Translation",
    verdict: "Top Amharic-English translation model",
    badgeClass: "b-nmt",
    badgeBg: "bg-[#f0f9ff]",
    badgeBorder: "border-[#bae6fd]",
    badgeText: "text-[#0369a1]",
  },
  {
    key: "b-emb",
    label: "Embeddings",
    verdict: "Most used embedding model for Amharic",
    badgeClass: "b-emb",
    badgeBg: "bg-[#f9f9f9]",
    badgeBorder: "border-neutral-200 dark:border-neutral-800",
    badgeText: "text-[#525252]",
  },
  {
    key: "b-llm",
    label: "LLM",
    verdict: "Most downloaded LLM for Amharic",
    badgeClass: "b-llm",
    badgeBg: "bg-[#faf5ff]",
    badgeBorder: "border-[#ddd6fe]",
    badgeText: "text-[#7c3aed]",
  },
  {
    key: "b-ner",
    label: "NER",
    verdict: "Best NER model for Ethiopian languages",
    badgeClass: "b-ner",
    badgeBg: "bg-[#fffbeb]",
    badgeBorder: "border-[#fde68a]",
    badgeText: "text-[#b45309]",
  },
];

function fmt(n: number | null | undefined): string {
  if (n == null) return "";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function cardUrl(d: Item): string | null {
  if (d.hf_url) return d.hf_url;
  if (d.url) return d.url;
  if (d.id && d.id.includes("/")) return `https://huggingface.co/${d.id}`;
  return null;
}

function openCard(d: Item) {
  const url = cardUrl(d);
  if (url) window.open(url, "_blank");
}

export default function BestFor() {
  const [models, setModels] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels()
      .then((d: any) => setModels(d?.data || d?.items || []))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, []);

  const winners = useMemo(() => {
    return TASKS.map((t) => {
      const candidates = models.filter((m) => m.bc === t.key);
      if (!candidates.length) return { task: t, model: null };
      const sorted = [...candidates].sort((a, b) => {
        const ad = a.downloads_monthly ?? a.dl ?? 0;
        const bd = b.downloads_monthly ?? b.dl ?? 0;
        return bd - ad;
      });
      return { task: t, model: sorted[0] };
    });
  }, [models]);

  if (!loading && winners.every((w) => !w.model)) return null;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
        Best for&hellip;
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:thin]">
        {winners.map(({ task, model }) => (
          <div
            key={task.key}
            className="snap-start shrink-0 w-[260px] sm:w-[280px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-4 relative cursor-pointer flex flex-col hover:border-[#d4d4d4] hover:shadow-[0_4px_14px_rgba(0,0,0,.06)] transition-all"
            onClick={() => model && openCard(model)}
            onKeyDown={(e) => e.key === "Enter" && model && openCard(model)}
            role={model ? "link" : undefined}
            tabIndex={model ? 0 : -1}
          >
            {model && (
              <div className="absolute top-4 right-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>
            )}
            <div className="flex items-center justify-between mb-3 sm:mb-2.5 gap-2">
              <span
                className={`font-mono text-[10px] sm:text-[9px] font-medium px-2 sm:px-1.5 py-0.5 rounded-full border whitespace-nowrap ${task.badgeText} ${task.badgeBg} ${task.badgeBorder}`}
              >
                {task.label}
              </span>
            </div>
            {loading ? (
              <>
                <div className="skeleton h-4 w-3/4 mb-2" />
                <div className="skeleton h-3 w-1/2 mb-3" />
                <div className="skeleton h-3 w-full mb-1" />
                <div className="skeleton h-3 w-5/6" />
              </>
            ) : model ? (
              <>
                <div className="text-[15px] sm:text-[13px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight mb-1 tracking-tight pr-5">
                  {model.id || model.name}
                </div>
                <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mb-3 sm:mb-2.5">
                  {model.org}
                </div>
                <div className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 sm:mb-2.5 flex-1">
                  {task.verdict}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500">
                    {fmt(model.downloads_monthly ?? model.dl)}/mo
                  </span>
                  {model.lang && (
                    <span className="font-mono text-[10px] sm:text-[9px] font-medium text-[#525252] bg-[#f4f4f5] border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5">
                      {model.lang}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">No model available yet</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}