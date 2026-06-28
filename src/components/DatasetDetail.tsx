import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Heart, Database, Globe, TrendingUp } from "lucide-react";
import type { DatasetSnapshotTimeline } from "@/lib/github";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

export default function DatasetDetail({ item, timeline }: { item: any; timeline?: DatasetSnapshotTimeline | null }) {
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Dataset not found</h1>
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 overflow-hidden">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800">
              Dataset
            </span>
            {item.isNew && (
              <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800">
                New
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight">
            {item.name}
          </h1>
          {item.org && (
            <p className="text-[13px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">{item.org}</p>
          )}
        </div>
        {item.hf_url && (
          <a
            href={item.hf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <ExternalLink size={13} /> Open on HF
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Download size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Downloads / mo</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{fmt(item.downloads_monthly ?? item.dl)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Heart size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Likes</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{fmt(item.likes)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Globe size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Languages</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{item.langs?.length ? item.langs.join(" · ") : "—"}</div>
          </div>
        </div>
      </div>

      {timeline && timeline.downloads.length >= 2 && (
        <div className="mb-8">
          <DatasetTimeline timeline={timeline} />
        </div>
      )}

      {item.description && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-[14px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        </section>
      )}

      {item.tags && item.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t: string) => (
              <span key={t} className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DatasetTimeline({ timeline }: { timeline: DatasetSnapshotTimeline }) {
  const { dates, downloads } = timeline;
  const width = 440;
  const height = 140;
  const pad = { top: 16, right: 16, bottom: 28, left: 48 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const min = Math.min(...downloads);
  const max = Math.max(...downloads);
  const range = max - min || 1;
  const stepX = chartW / (downloads.length - 1);

  function yPos(v: number) {
    return pad.top + chartH - ((v - min) / range) * chartH;
  }

  const linePts = downloads.map((v, i) => {
    const x = pad.left + i * stepX;
    const y = yPos(v);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const lastX = pad.left + (downloads.length - 1) * stepX;
  const bottomY = pad.top + chartH;
  const areaPts = `${linePts} L${lastX.toFixed(1)},${bottomY} L${pad.left},${bottomY} Z`;

  const gain = downloads[downloads.length - 1] - downloads[0];
  const growthPct = downloads[0] > 0 ? Math.round((gain / downloads[0]) * 100) : 0;

  const yTicks = 4;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = min + (range / yTicks) * i;
    yLabels.push({ val: Math.round(val), y: yPos(val) });
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Download timeline</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-neutral-400">
            {dates[0]} &ndash; {dates[dates.length - 1]}
          </span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {gain >= 0 ? "+" : ""}{fmt(gain)} ({growthPct >= 0 ? "+" : ""}{growthPct}%)
          </span>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="max-w-full">
        {yLabels.map((t, i) => (
          <g key={i}>
            <line x1={pad.left} y1={t.y} x2={width - pad.right} y2={t.y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
            <text x={pad.left - 6} y={t.y + 3} textAnchor="end" fill="currentColor" fillOpacity="0.35" fontSize="10" fontFamily="var(--font-geist-mono, monospace)">
              {fmt(t.val)}
            </text>
          </g>
        ))}
        <path d={areaPts} fill="#059669" fillOpacity="0.08" />
        <path d={linePts} fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pad.left} cy={yPos(downloads[0])} r="3.5" fill="#059669" stroke="white" strokeWidth="2" />
        <circle cx={pad.left + (downloads.length - 1) * stepX} cy={yPos(downloads[downloads.length - 1])} r="3.5" fill="#059669" stroke="white" strokeWidth="2" />
      </svg>

      <div className="flex justify-between mt-1 px-2 sm:px-12">
        {dates.map((d, i) => (
          <span key={i} className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{d.slice(5)}</span>
        ))}
      </div>
    </div>
  );
}
