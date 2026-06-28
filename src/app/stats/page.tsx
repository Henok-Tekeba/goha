"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Download, Heart, Database, Zap, Award } from "lucide-react";
import { fetchStatsHistory, fetchStatsInsights } from "@/lib/github";
import type { StatsHistoryEntry, StatsInsights } from "@/lib/github";

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

function LineChart({ data, width = 360, height = 180 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const pad = { top: 16, right: 12, bottom: 24, left: 40 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = chartW / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = pad.left + i * stepX;
    const y = pad.top + chartH - ((v - min) / range) * chartH;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const areaPts = `${pts} L${pad.left + (data.length - 1) * stepX},${pad.top + chartH} L${pad.left},${pad.top + chartH} Z`;

  const yTicks = 4;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = min + (range / yTicks) * i;
    const y = pad.top + chartH - (i / yTicks) * chartH;
    yLabels.push({ val: Math.round(val), y });
  }

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {yLabels.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={width - pad.right} y2={t.y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
          <text x={pad.left - 6} y={t.y + 3} textAnchor="end" fill="currentColor" fillOpacity="0.4" fontSize="10" fontFamily="var(--font-geist-mono, monospace)">
            {fmt(t.val)}
          </text>
        </g>
      ))}
      <path d={areaPts} fill="currentColor" fillOpacity="0.08" />
      <path d={pts} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ data, labels, width = 360, height = 160 }: { data: number[]; labels: string[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const pad = { top: 8, right: 12, bottom: 28, left: 8 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const maxVal = Math.max(...data, 1);
  const barW = Math.min(40, (chartW - (data.length - 1) * 4) / data.length);
  const totalW = data.length * barW + (data.length - 1) * 4;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      {data.map((v, i) => {
        const barH = (v / maxVal) * chartH;
        const x = pad.left + (chartW - totalW) / 2 + i * (barW + 4);
        const y = pad.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3" fill="currentColor" fillOpacity="0.7" className="hover:fill-opacity-100 transition-opacity" />
            <text x={x + barW / 2} y={pad.top + chartH + 14} textAnchor="middle" fill="currentColor" fillOpacity="0.4" fontSize="9" fontFamily="var(--font-geist-mono, monospace)">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function gainLabel(gain: number): string {
  if (gain > 1000) return fmt(gain);
  return String(gain);
}

export default function StatsPage() {
  const [history, setHistory] = useState<StatsHistoryEntry[]>([]);
  const [insights, setInsights] = useState<StatsInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStatsHistory(), fetchStatsInsights()])
      .then(([h, i]) => {
        setHistory(h);
        setInsights(i);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="text-center py-16">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="text-center py-16">
            <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Not enough data yet</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
              The stats page needs at least 2 days of snapshots to show charts. Check back after the scraper has run for a bit longer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const latest = history[history.length - 1];
  const first = history[0];
  const totalDlGrowth = first.totalModelDownloads > 0
    ? Math.round(((latest.totalModelDownloads - first.totalModelDownloads) / first.totalModelDownloads) * 100)
    : 0;
  const dailyDiffs = history.slice(1).map((h, i) => ({
    diff: h.totalModelDownloads - history[i].totalModelDownloads,
    label: h.date.slice(5),
  }));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8"
        >
          <ArrowLeft size={14} /> Back
        </Link>

        <div className="mb-10">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Stats</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {history.length} snapshots &middot; {first.date} &ndash; {latest.date}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <StatCard icon={<Download size={16} />} label="Model downloads" value={fmt(latest.totalModelDownloads)} change={totalDlGrowth} />
          <StatCard icon={<Database size={16} />} label="Models tracked" value={String(latest.models)} />
          <StatCard icon={<Heart size={16} />} label="Total likes" value={fmt(latest.totalLikes)} />
          <StatCard icon={<Database size={16} />} label="Datasets tracked" value={String(latest.datasets)} />
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Download trend</span>
          </div>
          <LineChart data={history.map(h => h.totalModelDownloads)} width={600} height={180} />
          <div className="flex justify-between mt-2 px-10">
            {history.map((h, i) => (
              <span key={i} className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">{h.date.slice(5)}</span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Daily download change</span>
          </div>
          <BarChart data={dailyDiffs.map(d => d.diff)} labels={dailyDiffs.map(d => d.label)} width={600} height={150} />
          <div className="flex justify-center gap-6 mt-3">
            {dailyDiffs.map((d, i) => (
              <span key={i} className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
                {d.label}: <span className={d.diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>+{d.diff}</span>
              </span>
            ))}
          </div>
        </div>

        {insights && (
          <>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Top gainers (5-day)</span>
              </div>
              <div className="space-y-2">
                {insights.topGainers.filter(g => g.gain >= 10).slice(0, 10).map((g, i) => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-neutral-400 w-4 shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{g.name}</div>
                        <div className="font-mono text-[10px] text-neutral-400">{g.org}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">+{gainLabel(g.gain)}</div>
                      <div className="font-mono text-[10px] text-neutral-400">{g.growth}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {insights.milestones.length > 0 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Milestones crossed</span>
                </div>
                <div className="space-y-2">
                  {insights.milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="text-sm text-neutral-900 dark:text-neutral-100">
                        <span className="font-medium">{m.id}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Crossed {fmt(m.milestone)} downloads</div>
                        <div className="font-mono text-[10px] text-neutral-400">{m.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="text-center py-8">
          <p className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500">
            Snapshots are recorded daily by the scraper. Each snapshot captures downloads and likes at that point in time.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change?: number }) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
      <div className="text-neutral-400 dark:text-neutral-500 mb-2">{icon}</div>
      <div className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">{value}</div>
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{label}</div>
      {change != null && (
        <div className={`font-mono text-[10px] mt-1 ${change >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% since first snapshot
        </div>
      )}
    </div>
  );
}
