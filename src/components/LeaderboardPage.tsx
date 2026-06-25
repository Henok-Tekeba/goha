"use client";

import { useEffect, useMemo, useState, createElement } from "react";
import Link from "next/link";
import { fetchModels } from "@/lib/github";
import { ArrowLeft, Trophy, Mic, Search, ArrowUpDown } from "lucide-react";

const LOWER_BETTER = new Set([
  "wer", "word_error_rate", "character_error_rate", "cer",
  "perplexity", "eval_loss", "query_active_dims", "corpus_active_dims",
]);

function sortDir(metricType: string): "asc" | "desc" {
  return LOWER_BETTER.has(metricType.toLowerCase()) ? "asc" : "desc";
}

function formatValue(val: number, metricType: string): string {
  const t = metricType.toLowerCase();
  if (t === "wer" || t === "word_error_rate" || t === "character_error_rate" || t === "cer") {
    const pct = val <= 1 ? val * 100 : val;
    return pct.toFixed(2) + "%";
  }
  if (t.includes("accuracy") || t.includes("precision") || t.includes("recall") || t.includes("mrr") || t.includes("ndcg") || t.includes("map")) {
    return (val * 100).toFixed(1) + "%";
  }
  if (val < 1) return (val * 100).toFixed(1) + "%";
  return val.toFixed(2);
}

interface LeaderboardRow {
  modelName: string;
  modelId: string;
  org: string;
  badge: string;
  bc: string;
  value: number;
  formatted: string;
  config?: string;
}

interface LeaderboardCategory {
  id: string;
  taskName: string;
  taskType: string;
  datasetName: string;
  metricName: string;
  metricType: string;
  sort: "asc" | "desc";
  rows: LeaderboardRow[];
}

function buildLeaderboards(models: any[]): LeaderboardCategory[] {
  const groups = new Map<string, any[]>();

  for (const m of models) {
    const evals = m.eval_results;
    if (!evals || !Array.isArray(evals)) continue;
    for (const er of evals) {
      const taskType = er.task?.type || "";
      const dsName = er.dataset?.name || "Unknown";
      const config = er.dataset?.config || "";
      const key = `${taskType}::${dsName}`;

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push({ model: m, eval: er, config });
    }
  }

  const categories: LeaderboardCategory[] = [];

  for (const [key, entries] of groups.entries()) {
    const first = entries[0].eval;
    const taskName = first.task?.name || "Unknown";
    const taskType = first.task?.type || "";
    const dsName = first.dataset?.name || "Unknown";

    const allMetrics = new Map<string, { type: string; name: string }>();
    for (const e of entries) {
      for (const mm of e.eval.metrics || []) {
        if (!allMetrics.has(mm.type)) {
          allMetrics.set(mm.type, { type: mm.type, name: mm.name });
        }
      }
    }

    for (const [metricType, metricInfo] of allMetrics.entries()) {
      const rows: LeaderboardRow[] = [];
      for (const e of entries) {
        const metric = (e.eval.metrics || []).find((mm: any) => mm.type === metricType);
        if (!metric || metric.value === undefined || metric.value === null) continue;
        rows.push({
          modelName: e.model.name,
          modelId: e.model.id,
          org: e.model.org,
          badge: e.model.badge,
          bc: e.model.bc,
          value: metric.value,
          formatted: formatValue(metric.value, metricType),
          config: e.config || undefined,
        });
      }

      if (rows.length < 2) continue;

      const sd = sortDir(metricType);
      rows.sort((a, b) => sd === "asc" ? a.value - b.value : b.value - a.value);

      const id = `${key}::${metricType}`.replace(/[^a-z0-9]/gi, "-").toLowerCase();
      categories.push({
        id,
        taskName,
        taskType,
        datasetName: dsName + (entries[0].config ? ` (${entries[0].config})` : ""),
        metricName: metricInfo.name,
        metricType,
        sort: sd,
        rows,
      });
    }
  }

  categories.sort((a, b) => b.rows.length - a.rows.length);
  return categories;
}

const TASK_ICONS: Record<string, any> = {
  "automatic-speech-recognition": Mic,
  "information-retrieval": Search,
};

export default function LeaderboardPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchModels()
      .then((d: any) => setModels(d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => buildLeaderboards(models), [models]);
  const active = activeCategory ? categories.find(c => c.id === activeCategory) : categories[0];

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Leaderboards will show up once models publish evaluation results on HuggingFace.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-amber-500" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Leaderboards</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Models ranked by self-reported evaluation scores. Only categories with 2+ entries are shown.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              {cat.taskName} &middot; {cat.datasetName}
            </button>
          ))}
        </div>

        {active && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {createElement(TASK_ICONS[active.taskType] || Trophy, { size: 15, className: "text-neutral-400 dark:text-neutral-500" })}
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{active.taskName}</span>
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5">{active.datasetName}</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                <ArrowUpDown size={11} />
                {active.metricName} ({active.sort === "asc" ? "lower is better" : "higher is better"})
              </span>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {active.rows.map((row, i) => (
                <Link
                  key={row.modelId || row.modelName}
                  href={`/models/${row.modelId}`}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
                >
                  <span className={`font-mono text-[11px] sm:text-[10px] w-6 text-center shrink-0 ${
                    i === 0 ? "text-amber-500 font-bold" :
                    i === 1 ? "text-neutral-400" :
                    i === 2 ? "text-amber-700 dark:text-amber-300" :
                    "text-neutral-300 dark:text-neutral-600"
                  }`}>
                    {i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : `#${i + 1}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] sm:text-[12px] font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {row.modelName}
                    </div>
                    <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{row.org}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[14px] sm:text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">{row.formatted}</div>
                    <div className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 uppercase">{row.badge || "Model"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 text-center mt-6">
          Scores are self-reported by model authors on HuggingFace. goha.et displays them as-is.
        </p>
      </div>
    </div>
  );
}
