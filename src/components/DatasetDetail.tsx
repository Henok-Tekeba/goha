import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Heart, Database, Globe, TrendingUp } from "lucide-react";
import type { DatasetSnapshotTimeline } from "@/lib/github";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 mb-1">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function DatasetDetail({ item, timeline }: { item: any; timeline?: DatasetSnapshotTimeline | null }) {
  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="text-center py-16">
          <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Dataset not found</div>
          <p className="text-sm text-neutral-500">This dataset doesn&apos;t exist or hasn&apos;t been indexed yet.</p>
        </div>
      </div>
    );
  }

  const hfUrl = item.hf_url || (item.id ? `https://huggingface.co/datasets/${item.id}` : null);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
          <ArrowLeft size={14} /> Back to browse
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800">
                Dataset
              </span>
              {item.isNew && (
                <span className="font-mono text-[9px] text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-full px-1.5 py-0.5 inline-flex items-center gap-1">
                  New
                </span>
              )}
            </div>
            {hfUrl && (
              <a href={hfUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 transition-colors">
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View on HuggingFace</span>
              </a>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {item.name}
          </h1>
          {item.org && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <Database size={14} />
              {item.org}
            </div>
          )}

          {item.desc && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{item.desc}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatBox icon={<Download size={14} />} label="Downloads / mo" value={fmt(item.downloads_monthly ?? item.dl)} />
          <StatBox icon={<Heart size={14} />} label="Likes" value={fmt(item.likes)} />
          <StatBox icon={<Globe size={14} />} label="Languages" value={item.langs?.length ? item.langs.join(" · ") : "—"} />
        </div>

        {/* Timeline */}
        {timeline && timeline.downloads.length >= 2 && (
          <div className="mb-6">
            <DatasetTimeline timeline={timeline} />
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Details">
              <div className="space-y-3">
                {item.file_count != null && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Files</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">{fmt(item.file_count)}</span>
                  </div>
                )}
                {item.size_categories && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Size</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">{item.size_categories}</span>
                  </div>
                )}
                {item.license && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">License</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">{item.license}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Tags & Languages">
              <div className="space-y-3">
                {item.langs && item.langs.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {item.langs.map((l: string) => (
                        <span key={l} className="font-mono text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-0.5">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 8).map((t: string) => (
                        <span key={t} className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-8">
          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
            <span>Indexed {item.added_at ? new Date(item.added_at).toLocaleDateString() : "recently"}</span>
          </div>
        </div>
      </div>
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
