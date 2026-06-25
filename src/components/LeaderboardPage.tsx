"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchModels } from "@/lib/github";
import { ArrowLeft, Trophy, Mic, Search, Languages, Hash, Brain, Eye } from "lucide-react";

interface LBEntry {
  modelName: string;
  modelId: string;
  org: string;
  score: number;
  display: string;
  badge: string;
  dataset?: string;
}

interface LBCategory {
  key: string;
  label: string;
  icon: any;
  metricLabel: string;
  lowerBetter: boolean;
  entries: LBEntry[];
}

const TASK_DEFS = [
  {
    badges: ["b-asr"],
    label: "Automatic Speech Recognition",
    key: "asr",
    icon: Mic,
    metricLabel: "WER \u2193",
    lowerBetter: true,
    pickMetric: (metrics: any[]) => {
      const wer = metrics.find((m: any) => m.type?.toLowerCase() === "wer");
      if (wer) return { value: wer.value, label: "" };
      const cer = metrics.find((m: any) => m.type?.toLowerCase() === "character_error_rate");
      if (cer) return { value: cer.value, label: "CER" };
      return null;
    },
    format: (v: number) => {
      const pct = v <= 1 ? v * 100 : v;
      return pct.toFixed(2) + "%";
    },
  },
  {
    badges: ["b-nmt", "b-translation"],
    label: "Machine Translation",
    key: "translation",
    icon: Languages,
    metricLabel: "BLEU \u2191",
    lowerBetter: false,
    pickMetric: (metrics: any[]) => {
      const bleu = metrics.find((m: any) => m.type?.toLowerCase() === "bleu");
      if (bleu) return { value: bleu.value, label: "" };
      return null;
    },
    format: (v: number) => v.toFixed(2),
  },
  {
    badges: ["b-ner"],
    label: "Named Entity Recognition",
    key: "ner",
    icon: Hash,
    metricLabel: "F1 \u2191",
    lowerBetter: false,
    pickMetric: (metrics: any[]) => {
      const f1 = metrics.find((m: any) => m.type?.toLowerCase() === "f1" || m.name?.toLowerCase() === "f1");
      if (f1) return { value: f1.value, label: "" };
      const acc = metrics.find((m: any) => m.type?.toLowerCase() === "accuracy");
      if (acc) return { value: acc.value, label: "Acc" };
      return null;
    },
    format: (v: number) => (v <= 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(1) + "%"),
  },
  {
    badges: ["b-emb"],
    label: "Embeddings & Retrieval",
    key: "embeddings",
    icon: Search,
    metricLabel: "NDCG@10 \u2191",
    lowerBetter: false,
    pickMetric: (metrics: any[]) => {
      const pref = ["ndcg@10", "ndcg", "cosine_ndcg@10", "mrr@10", "cosine_accuracy@1", "accuracy@1"];
      for (const p of pref) {
        const m = metrics.find((x: any) => x.type?.toLowerCase() === p);
        if (m) return { value: m.value, label: m.name };
      }
      return null;
    },
    format: (v: number) => (v <= 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(2)),
  },
  {
    badges: ["b-llm"],
    label: "Language Models",
    key: "llm",
    icon: Brain,
    metricLabel: "Perplexity \u2193",
    lowerBetter: true,
    pickMetric: (metrics: any[]) => {
      const ppl = metrics.find((m: any) => m.type?.toLowerCase() === "perplexity");
      if (ppl) return { value: ppl.value, label: "" };
      return null;
    },
    format: (v: number) => v.toFixed(2),
  },
  {
    badges: ["b-default", "b-vision"],
    label: "Vision & Classification",
    key: "vision",
    icon: Eye,
    metricLabel: "Accuracy \u2191",
    lowerBetter: false,
    pickMetric: (metrics: any[]) => {
      const acc = metrics.find((m: any) => m.type?.toLowerCase() === "accuracy");
      if (acc) return { value: acc.value, label: "" };
      return null;
    },
    format: (v: number) => (v <= 1 ? (v * 100).toFixed(1) + "%" : v.toFixed(1) + "%"),
  },
];

function buildLeaderboards(models: any[]): LBCategory[] {
  const categories: LBCategory[] = [];

  for (const def of TASK_DEFS) {
    const entries: LBEntry[] = [];

    for (const m of models) {
      const badgeMatch = def.badges.includes(m.bc);
      if (!badgeMatch) continue;
      if (!m.eval_results || !Array.isArray(m.eval_results)) continue;

      let best: { value: number; label: string } | null = null;
      let dataset = "";

      for (const er of m.eval_results) {
        const metrics = er.metrics || [];
        const picked = def.pickMetric(metrics);
        if (!picked) continue;
        if (!best || (def.lowerBetter ? picked.value < best.value : picked.value > best.value)) {
          best = picked;
          dataset = er.dataset?.name || "";
        }
      }

      if (!best) continue;

      const display = best.label ? `${def.format(best.value)} (${best.label})` : def.format(best.value);
      entries.push({
        modelName: m.name,
        modelId: m.id,
        org: m.org,
        score: best.value,
        display,
        badge: m.badge,
        dataset,
      });
    }

    if (entries.length < 1) continue;

    entries.sort((a, b) => def.lowerBetter ? a.score - b.score : b.score - a.score);

    categories.push({
      key: def.key,
      label: def.label,
      icon: def.icon,
      metricLabel: def.metricLabel,
      lowerBetter: def.lowerBetter,
      entries,
    });
  }

  return categories;
}

export default function LeaderboardPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    fetchModels()
      .then((d: any) => setModels(d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => buildLeaderboards(models), [models]);
  const active = categories.find(c => c.key === activeKey) || categories[0];

  useEffect(() => {
    if (categories.length > 0 && !activeKey) {
      setActiveKey(categories[0].key);
    }
  }, [categories, activeKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="skeleton h-6 w-32 rounded mb-8" />
          {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-xl mb-3" />)}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="text-center py-16">
            <Trophy size={32} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
            <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No leaderboards yet</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Models need to publish evaluation results on HuggingFace to appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-amber-500" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Leaderboards</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Models ranked by the standard metric for their task. Scores are self-reported on HuggingFace.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {categories.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveKey(cat.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                  activeKey === cat.key
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                }`}
              >
                <Icon size={13} />
                {cat.label}
                <span className="opacity-60">({cat.entries.length})</span>
              </button>
            );
          })}
        </div>

        {active && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => { const Icon = active.icon; return <Icon size={15} className="text-neutral-400 dark:text-neutral-500" />; })()}
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{active.label}</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
                {active.metricLabel} &middot; {active.entries.length} model{active.entries.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {active.entries.map((entry, i) => (
                <Link
                  key={entry.modelId || entry.modelName}
                  href={`/models/${entry.modelId}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                >
                  <span className="font-mono text-[11px] sm:text-[10px] w-6 text-center shrink-0">
                    {i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : `#${i + 1}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] sm:text-[12px] font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {entry.modelName}
                    </div>
                    <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-2">
                      <span>{entry.org}</span>
                      {entry.dataset && (
                        <>
                          <span className="text-neutral-300 dark:text-neutral-600">&middot;</span>
                          <span>{entry.dataset}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] sm:text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{entry.display}</div>
                    <div className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 uppercase">{entry.badge || "Model"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 text-center mt-6">
          Scores are self-reported by model authors on HuggingFace via their model card. Only the primary metric per task type is shown.
        </p>
      </div>
    </div>
  );
}
