"use client";

import type { ModelSnapshotTimeline } from "@/lib/github";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

export default function ModelTimeline({ timeline }: { timeline: ModelSnapshotTimeline }) {
  if (!timeline || timeline.downloads.length < 2) return null;

  const { dates, downloads, likes } = timeline;
  const width = 440;
  const height = 160;
  const pad = { top: 20, right: 16, bottom: 28, left: 48 };
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

  const yTicks = 5;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = min + (range / yTicks) * i;
    yLabels.push({ val: Math.round(val), y: yPos(val) });
  }

  const dotCoords = downloads.map((v, i) => {
    const x = pad.left + i * stepX;
    return { x, y: yPos(v), active: i === downloads.length - 1 || i === 0 };
  });

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Download timeline
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

        {dotCoords.map((d, i) => (
          d.active ? (
            <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="#059669" stroke="white" strokeWidth="2" />
          ) : null
        ))}
      </svg>

      <div className="flex justify-between mt-1 px-2 sm:px-12">
        {dates.map((d, i) => (
          <span key={i} className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">
            {d.slice(5)}
          </span>
        ))}
      </div>

      {likes.some((l, i) => i > 0 && l !== likes[0]) && (
        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Likes over time
          </div>
          <LikesTimeline likes={likes} dates={dates} width={width} height={80} />
        </div>
      )}
    </div>
  );
}

function LikesTimeline({ likes, dates, width, height }: { likes: number[]; dates: string[]; width: number; height: number }) {
  const pad = { top: 4, right: 16, bottom: 20, left: 32 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const stepX = chartW / (likes.length - 1);
  const min = Math.min(...likes);
  const max = Math.max(...likes);
  const range = max - min || 1;

  const pts = likes.map((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - ((v - min) / range) * chartH;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const yTicks = 3;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = min + (range / yTicks) * i;
    yLabels.push({ val: Math.round(val), y: pad.top + chartH - (i / yTicks) * chartH });
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="max-w-full">
      {yLabels.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={width - pad.right} y2={t.y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
          <text x={pad.left - 4} y={t.y + 3} textAnchor="end" fill="currentColor" fillOpacity="0.35" fontSize="9" fontFamily="var(--font-geist-mono, monospace)">
            {t.val}
          </text>
        </g>
      ))}
      <path d={pts} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
