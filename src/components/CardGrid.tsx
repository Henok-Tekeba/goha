"use client";

import type { Item } from "@/types";
import Sparkline from "./Sparkline";
import { Sparkles, Trophy, Gem } from "lucide-react";

const MX = 2341;

function fmt(n: number | null): string {
  if (n === null) return "";
  return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

function cardUrl(d: Item): string | null {
  if (d.hf_url) return d.hf_url;
  if (d.url) return d.url;
  if (d.id && d.id.includes("/")) {
    const itemType = d._type || (d as any).type;
    const prefix = itemType === "dataset" ? "datasets/" : "";
    return `https://huggingface.co/${prefix}${d.id}`;
  }
  return null;
}

function openCard(d: Item) {
  const url = cardUrl(d);
  if (url) window.open(url, "_blank");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(s?: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function paperAuthors(authors?: string[]): string {
  if (!authors || authors.length === 0) return "";
  if (authors.length <= 2) return authors.join(", ");
  return `${authors[0]}, ${authors[1]} et al.`;
}

function paperCategory(c: any): string | null {
  if (!c) return null;
  if (Array.isArray(c)) return c[0] || null;
  return c;
}

function paperUrl(d: Item): string | null {
  const u = (d as any).url;
  if (typeof u === "string" && u.startsWith("http")) return u;
  const id = (d as any).arxiv_id;
  if (id) return `https://arxiv.org/abs/${id}`;
  return cardUrl(d);
}

const CLAMP_2: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const CLAMP_1: React.CSSProperties = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const BADGE_STYLES: Record<string, string> = {
  "b-asr": "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  "b-nmt": "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800",
  "b-llm": "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  "b-ner": "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  "b-emb": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-ds": "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
  "b-co": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-default": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-paper": "text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800",
};

const VERDICT_STYLES: Record<string, string> = {
  best: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  new: "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  underrated: "text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800",
};

const VERDICT_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  best: Trophy,
  new: Sparkles,
  underrated: Gem,
};

function badgeClass(bc?: string): string {
  return BADGE_STYLES[bc ?? ""] ?? "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700";
}

export default function CardGrid({
  items,
  query,
  loading,
  compareMode,
  compareSelected,
  onToggleCompare,
}: {
  items: Item[];
  query: string;
  loading?: boolean;
  compareMode?: boolean;
  compareSelected?: Set<string>;
  onToggleCompare?: (item: Item) => void;
}) {
  const cards = items || [];

  if (loading) {
    return (
    <div className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5 sm:gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 sm:p-4 min-w-0 w-full">
              <div className="flex items-start justify-between mb-2 sm:mb-2.5 gap-1.5">
                <div className="skeleton h-4 w-14 rounded-full" />
              </div>
              <div className="skeleton h-4 w-3/4 mb-1.5" />
              <div className="skeleton h-3 w-1/2 mb-2 sm:mb-2.5" />
              <div className="skeleton h-6 w-full mb-3 sm:mb-3" />
              <div className="flex items-center gap-1">
                <div className="skeleton h-3 w-12 rounded-full" />
                <div className="skeleton h-3 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-2.5">
          <div className="text-center text-neutral-400 dark:text-neutral-500 text-[13px] col-span-full py-10">
            No results for &ldquo;{query}&rdquo;
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="px-4 sm:px-6 py-4 sm:py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5 sm:gap-3">
        {cards.map((d, i) => {
          const pct = d.dl !== null ? Math.round((d.dl / MX) * 100) : 0;
          const isCompany = d.bc === "b-co";
          const isPaper = (d as any)._type === "paper" || d.bc === "b-paper" || Array.isArray((d as any).authors);

          if (isPaper) {
            const title = d.name;
            const authors = (d as any).authors as string[] | undefined;
            const abstract = ((d as any).abstract as string | undefined) ?? d.desc ?? "";
            const cat = paperCategory((d as any).categories ?? (d as any).primary_category);
            const pub = (d as any).published_date as string | undefined;
            const href = paperUrl(d);

            return (
              <div
                key={`paper-${(d as any).arxiv_id || d.name}-${i}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 sm:p-4 cursor-pointer flex flex-col relative group hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all min-w-0 w-full"
                onClick={() => href && window.open(href, "_blank")}
                onKeyDown={(e) => e.key === "Enter" && href && window.open(href, "_blank")}
                role="link"
                tabIndex={0}
              >
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Open on arXiv"
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 inline-flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-emerald-600 dark:text-emerald-400"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </a>
                )}
                <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-1.5 min-w-0 w-full pr-6 sm:pr-7">
                  {cat ? (
                    <span className={`font-mono text-[9px] sm:text-[9px] font-medium px-1.5 sm:px-1.5 py-0.5 rounded-full border whitespace-nowrap ${BADGE_STYLES["b-paper"]}`}>
                      {cat}
                    </span>
                  ) : (
                    <span />
                  )}
                  {pub && (
                    <span className="font-mono text-[9px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0">
                      {fmtDate(pub)}
                    </span>
                  )}
                </div>
                <div
                  className="text-[13px] sm:text-[13px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight mb-0.5 tracking-tight"
                  style={CLAMP_1}
                  title={title}
                >
                  {title}
                </div>
                {authors && authors.length > 0 && (
                  <div className="font-mono text-[10px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mb-2 sm:mb-2.5 truncate w-full">
                    {paperAuthors(authors)}
                  </div>
                )}
                <div
                  className="text-xs sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed flex-1"
                  style={CLAMP_2}
                >
                  {abstract}
                </div>
              </div>
            );
          }

          if (isCompany) {
            const links: { label: string; url: string }[] = [];
            if (d.website) links.push({ label: "Website", url: d.website });
            if (d.github) links.push({ label: "GitHub", url: d.github });
            if (d.hf_org) links.push({ label: "HuggingFace", url: d.hf_org });
            const modelCount = d.models_count ?? (d.related_models?.length ?? d.models?.length ?? 0);
            const modelPreview = (d.related_models || d.models || []).slice(0, 3);

            return (
              <div
                key={`${d.name}-${i}`}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 sm:p-5 cursor-pointer flex flex-col relative group hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all min-w-0 w-full"
                onClick={() => openCard(d)}
                onKeyDown={(e) => e.key === "Enter" && openCard(d)}
                role="link"
                tabIndex={0}
              >
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-1.5">
                  {d.isNew && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
                <div className="flex items-start justify-between mb-2 gap-1.5 min-w-0 w-full pr-6 sm:pr-7">
                  <span className="font-mono text-[9px] sm:text-[9px] font-medium px-1.5 sm:px-1.5 py-0.5 rounded-full border text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    Company
                  </span>
                  {d.founded && (
                    <span className="font-mono text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">est. {d.founded}</span>
                  )}
                </div>
                <div className="text-[14px] sm:text-[15px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight mb-0.5 tracking-tight truncate w-full">
                  {d.name}
                </div>
                <div
                  className="text-xs sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 sm:mb-3 flex-1 w-full"
                  style={CLAMP_2}
                >
                  {d.desc}
                </div>
                {modelPreview.length > 0 && (
                  <div className="mb-2 sm:mb-3 w-full">
                    <div className="font-mono text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                      {modelCount} model{modelCount === 1 ? "" : "s"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {modelPreview.map((id) => (
                        <span
                          key={id}
                          className="font-mono text-[8px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-700 truncate max-w-[120px] sm:max-w-[160px]"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {links.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-neutral-200 dark:border-neutral-800 w-full">
                    {links.map((l) => (
                      <button
                        key={l.label}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(l.url, "_blank");
                        }}
                        className="font-mono text-[9px] sm:text-[9px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded px-1.5 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors inline-flex items-center gap-1"
                      >
                        {l.label}
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 17L17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const cardKey = (d as any).arxiv_id || d.id || d.name;
          const compareChecked = compareMode && compareSelected?.has(cardKey) === true;

          return (
            <div
              key={`${d.name}-${i}`}
              className={`bg-white dark:bg-neutral-900 border rounded-xl p-3 sm:p-4 cursor-pointer flex flex-col relative group transition-all min-w-0 w-full ${compareChecked ? "border-emerald-500 ring-1 ring-emerald-300 dark:ring-emerald-700" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"}`}
              onClick={() => {
                if (compareMode) {
                  onToggleCompare?.(d);
                  return;
                }
                openCard(d);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (compareMode) {
                    onToggleCompare?.(d);
                  } else {
                    openCard(d);
                  }
                }
              }}
              role="link"
              tabIndex={0}
            >
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5">
                {compareMode ? (
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={compareChecked}
                    aria-label={compareChecked ? `Remove ${d.name} from compare` : `Add ${d.name} to compare`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCompare?.(d);
                    }}
                    className={`w-5 h-5 rounded border inline-flex items-center justify-center transition-all ${
                      compareChecked
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {compareChecked && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <>
                    {d.isNew && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400">
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </>
                )}
              </div>
              <div className="flex items-start justify-between mb-2 sm:mb-2.5 gap-1.5 min-w-0 w-full pr-7 sm:pr-0">
                <div className="flex items-center gap-1 flex-wrap min-w-0 overflow-hidden">
                  <span
                    className={`font-mono text-[9px] sm:text-[9px] font-medium px-1.5 sm:px-1.5 py-0.5 rounded-full border whitespace-nowrap ${badgeClass(d.bc)}`}
                  >
                    {d.badge}
                  </span>
                  {d.verdict && d.verdict.type !== "growing" && (() => {
                    const VIcon = VERDICT_ICONS[d.verdict.type];
                    return (
                      <span className={`font-mono text-[8px] sm:text-[9px] font-medium px-1 py-0.5 rounded-full border inline-flex items-center gap-1 ${VERDICT_STYLES[d.verdict.type] ?? VERDICT_STYLES.new}`}>
                        {VIcon && <VIcon size={10} />}
                        {d.verdict.label}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="text-[13px] sm:text-[13px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight mb-0.5 tracking-tight truncate w-full">
                {d.name}
              </div>
              <div className="font-mono text-[10px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mb-2 sm:mb-2.5 truncate w-full">{d.org}</div>
              <div
                className="text-xs sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 sm:mb-3 flex-1 w-full"
                style={CLAMP_2}
              >
                {d.desc}
              </div>
              {d.dl !== null && (
                <div className="font-mono text-[9px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap w-full">
                  <span className="hidden sm:inline-flex items-center gap-1.5">
                    <Sparkline sparkline={(d as any).sparkline} />
                    <div className="w-7 h-[3px] bg-neutral-200 dark:bg-neutral-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded opacity-50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {fmt(d.dl)}/mo
                    {d.growth != null && d.growth !== 0 && Math.abs(d.growth) >= 5 && (
                      <span className={`text-[8px] sm:text-[9px] font-medium flex items-center gap-[1px] ${
                        d.growth > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                      }`}>
                        {d.growth > 0 ? "\u2191" : "\u2193"}
                        {Math.abs(d.growth)}%
                      </span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex gap-1 flex-wrap min-w-0 w-full">
                {d.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[8px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-700"
                  >
                    {t}
                  </span>
                ))}
                {d.lang && (
                  <span className="font-mono text-[8px] sm:text-[9px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                    {d.lang}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}