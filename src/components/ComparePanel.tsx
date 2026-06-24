"use client";

import type { Item } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function hfUrl(d: Item): string | null {
  if (d.hf_url) return d.hf_url;
  if (d.id && d.id.includes("/")) return `https://huggingface.co/${d.id}`;
  return null;
}

function verdict(items: Item[]): {
  mostDownloads: Item | null;
  mostRecent: Item | null;
  mostLikes: Item | null;
} {
  if (items.length === 0) return { mostDownloads: null, mostRecent: null, mostLikes: null };
  const mostDownloads = [...items].sort((a, b) => (b.dl ?? -1) - (a.dl ?? -1))[0];
  const mostLikes = [...items].sort((a, b) => (b.likes ?? -1) - (a.likes ?? -1))[0];
  const withDates = items.filter((i) => i.added_at);
  const mostRecent = withDates.length
    ? [...withDates].sort((a, b) => new Date(b.added_at!).getTime() - new Date(a.added_at!).getTime())[0]
    : null;
  return { mostDownloads, mostRecent, mostLikes };
}

export default function ComparePanel({
  items,
  onClose,
  onRemove,
}: {
  items: Item[];
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const v = verdict(items);

  const Row = ({ label, get, render }: { label: string; get: (i: Item) => string; render?: (s: string, i: Item) => React.ReactNode }) => (
    <div className="grid gap-2 py-2 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0" style={{ gridTemplateColumns: `120px repeat(${items.length}, minmax(0, 1fr))` }}>
      <div className="font-mono text-[10px] sm:text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 self-center">
        {label}
      </div>
      {items.map((i) => {
        const val = get(i);
        return (
          <div key={i.id || i.name} className="text-[12px] sm:text-[11px] text-neutral-900 dark:text-neutral-100 self-center truncate" title={val}>
            {render ? render(val, i) : val || "—"}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close comparison"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[1px]"
      />
      <div className="relative bg-white dark:bg-neutral-950 w-full max-w-3xl h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <div className="text-[14px] sm:text-[13px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
              Compare models
            </div>
            <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {items.length} selected
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
          <div className="grid gap-3" style={{ gridTemplateColumns: `120px repeat(${items.length}, minmax(0, 1fr))` }}>
            <div />
            {items.map((i) => {
              const url = hfUrl(i);
              return (
                <div key={i.id || i.name} className="flex items-start justify-between gap-2 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-neutral-50 dark:bg-neutral-900">
                  <div className="min-w-0">
                    <div className="text-[13px] sm:text-[12px] font-medium text-neutral-900 dark:text-neutral-100 leading-tight truncate" title={i.name}>
                      {i.name}
                    </div>
                    <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                      {i.org}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(i.id || i.name)}
                    aria-label={`Remove ${i.name}`}
                    className="shrink-0 w-5 h-5 rounded-full inline-flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute hidden"
                    >
                      open
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Details
            </div>
            <Row label="Type" get={(i) => i.badge || "—"} />
            <Row label="Language" get={(i) => i.lang || "—"} />
            <Row label="Downloads" get={(i) => fmtNum(i.dl)} />
            <Row label="Likes" get={(i) => fmtNum(i.likes)} />
            <Row label="Last updated" get={(i) => fmtDate(i.added_at)} />
            <Row
              label="Tags"
              get={(i) => (i.tags || []).join(", ")}
              render={(_val, i) => (
                <div className="flex flex-wrap gap-1">
                  {(i.tags || []).slice(0, 4).map((t) => (
                    <span key={t} className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5 border border-neutral-200 dark:border-neutral-700">
                      {t}
                    </span>
                  ))}
                  {(i.tags || []).length === 0 && <span className="text-neutral-400 dark:text-neutral-500">—</span>}
                </div>
              )}
            />
            <Row
              label="Links"
              get={() => ""}
              render={() => {
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((i) => {
                      const url = hfUrl(i);
                      if (!url) return <span key={i.id || i.name} className="text-neutral-400 dark:text-neutral-500">—</span>;
                      return (
                        <a
                          key={i.id || i.name}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] sm:text-[9px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors inline-flex items-center gap-1"
                        >
                          {i.name}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7" />
                            <path d="M7 7h10v10" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                );
              }}
            />
          </div>

          <div className="mt-5">
            <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
              Verdict
            </div>
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-neutral-50 dark:bg-neutral-900 space-y-2">
              {v.mostDownloads && (
                <div className="text-[12px] sm:text-[11px] text-neutral-900 dark:text-neutral-100">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-2">Downloads</span>
                  <span className="font-medium">{v.mostDownloads.name}</span>
                  <span className="text-neutral-400 dark:text-neutral-500"> · {fmtNum(v.mostDownloads.dl)}/mo</span>
                </div>
              )}
              {v.mostLikes && (
                <div className="text-[12px] sm:text-[11px] text-neutral-900 dark:text-neutral-100">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-2">Likes</span>
                  <span className="font-medium">{v.mostLikes.name}</span>
                  <span className="text-neutral-400 dark:text-neutral-500"> · {fmtNum(v.mostLikes.likes)}</span>
                </div>
              )}
              {v.mostRecent && (
                <div className="text-[12px] sm:text-[11px] text-neutral-900 dark:text-neutral-100">
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mr-2">Most recent</span>
                  <span className="font-medium">{v.mostRecent.name}</span>
                  <span className="text-neutral-400 dark:text-neutral-500"> · {fmtDate(v.mostRecent.added_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}