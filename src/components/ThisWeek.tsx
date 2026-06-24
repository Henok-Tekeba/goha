"use client";

import { useEffect, useState } from "react";
import { fetchModels, fetchPapers, fetchTrending } from "@/lib/github";

function fmt(n: number | null | undefined) {
  if (n == null) return "";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

export default function ThisWeek() {
  const [newModels, setNewModels] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [newPapers, setNewPapers] = useState<any[]>([]);
  const [editorial, setEditorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchModels(),
      fetchTrending(),
      fetchPapers(),
    ])
      .then(([modelsRes, trendingRes, papersRes]) => {
        const allModels = modelsRes?.data || [];
        setNewModels(allModels.sort((a: any, b: any) => new Date(b.added_at || 0).getTime() - new Date(a.added_at || 0).getTime()).slice(0, 3));
        const rawTrending = trendingRes?.items || [];
        setTrending(rawTrending.sort((a: any, b: any) => (b.dl || 0) - (a.dl || 0)));
        setNewPapers((papersRes?.data || []).slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
          This Week in Ethiopian AI
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-[#fafafa] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
              <div className="skeleton h-3 w-20 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-3 w-3/4 rounded mb-2" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
        This Week in Ethiopian AI
      </div>
      {editorial && (
        <div className="bg-[#fafafa] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-600 dark:bg-emerald-500 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              Editorial
            </span>
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">{editorial.week_of}</span>
          </div>
          {editorial.summary && (
            <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed mb-2">{editorial.summary}</p>
          )}
          {editorial.highlight && (
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">{editorial.highlight}</p>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#fafafa] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-600 dark:bg-emerald-500 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              New Models
            </span>
            <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">{newModels.length}</span>
          </div>
          <div className="space-y-2.5">
            {newModels.slice(0, 3).map((m: any, i: number) => (
              <div key={i} className="text-sm leading-snug">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{m.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{m.org}</span>
                  <span className={`font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${
                    m.bc === "b-asr" ? "text-emerald-600 dark:text-emerald-400 bg-emerald-600 dark:bg-emerald-500 border-emerald-200 dark:border-emerald-800" :
                    m.bc === "b-llm" ? "text-[#7c3aed] dark:text-violet-300 bg-[#faf5ff] dark:bg-violet-950 border-[#ddd6fe] dark:border-violet-800" :
                    m.bc === "b-nmt" ? "text-[#0369a1] dark:text-sky-300 bg-[#f0f9ff] dark:bg-sky-950 border-[#bae6fd] dark:border-sky-800" :
                    "text-[#525252] dark:text-neutral-300 bg-[#f9f9f9] dark:bg-neutral-800 border-neutral-200 dark:border-neutral-800"
                  }`}>{m.badge}</span>
                  {m.dl != null && m.dl > 0 && (
                    <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{fmt(m.dl)}/mo</span>
                  )}
                </div>
              </div>
            ))}
            {!newModels.length && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">No new models this week</div>
            )}
          </div>
        </div>
        <div className="bg-[#fafafa] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] font-medium text-[#7c3aed] dark:text-violet-300 bg-[#faf5ff] dark:bg-violet-950 border border-[#ddd6fe] dark:border-violet-800 px-2 py-0.5 rounded-full">
              Most Active
            </span>
            <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">{trending.length}</span>
          </div>
          <div className="space-y-2.5">
            {trending.slice(0, 3).map((t: any, i: number) => (
              <div key={i} className="text-sm leading-snug">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{t.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{t.org}</span>
                  <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{fmt(t.dl)}/mo</span>
                </div>
              </div>
            ))}
            {!trending.length && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">No trending items</div>
            )}
          </div>
        </div>
        <div className="bg-[#fafafa] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[9px] font-medium text-[#be185d] dark:text-pink-300 bg-[#fdf2f8] dark:bg-pink-950 border border-[#fbcfe8] dark:border-pink-800 px-2 py-0.5 rounded-full">
              New Research
            </span>
            <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">{newPapers.length}</span>
          </div>
          <div className="space-y-2.5">
            {newPapers.slice(0, 3).map((p: any, i: number) => (
              <div key={i} className="text-sm leading-snug">
                <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{p.title || p.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{p.org || (p.authors || []).slice(0, 2).join(", ")}</span>
                {(p.categories || []).slice(0, 1).map((c: string) => (
                  <span key={c} className="font-mono text-[9px] text-[#525252] dark:text-neutral-300 bg-[#f9f9f9] dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-1.5 py-0.5 rounded-full">{c}</span>
                ))}
                </div>
              </div>
            ))}
            {!newPapers.length && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic">No new research this week</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
