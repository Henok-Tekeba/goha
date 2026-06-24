"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { fetchModels, fetchDatasets, fetchPapers } from "@/lib/github";

type Model = {
  name: string;
  org: string;
  badge?: string;
  bc?: string;
  dl?: number | null;
  downloads_monthly?: number | null;
  likes?: number;
  lang?: string | null;
  langs?: string[];
  tags?: string[];
  authors?: string[];
  added_at?: string;
  id?: string;
};

type Paper = {
  title: string;
  authors?: string[];
  published_date?: string;
  categories?: string[];
};

const TYPE_LABEL: Record<string, string> = {
  ASR: "ASR",
  NMT: "Translation",
  LLM: "LLM",
  NER: "NER",
  Embed: "Embeddings",
  DS: "Datasets",
};

const LANG_LABEL: Record<string, string> = {
  amharic: "Amharic",
  oromo: "Oromo",
  tigrinya: "Tigrinya",
  geez: "Ge'ez",
  english: "English",
};

const BC_COLOR: Record<string, string> = {
  "b-asr": "#059669",
  "b-nmt": "#0369a1",
  "b-llm": "#7c3aed",
  "b-ner": "#b45309",
  "b-emb": "#525252",
  "b-ds": "#0f766e",
};

type SparkPoint = { week: string; dl: number }; // inline for velocity computation

const ChartCard = ({
  title,
  subtitle,
  children,
  height = 260,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}) => (
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-4">
    <div className="mb-3 sm:mb-2.5">
      <div className="text-[14px] sm:text-[13px] font-medium tracking-tight">{title}</div>
      {subtitle && (
        <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">
          {subtitle}
        </div>
      )}
    </div>
    <div style={{ width: "100%", height }}>{children}</div>
  </div>
);

const StatNumber = ({ value, label }: { value: string | number; label: string }) => (
  <div>
    <div className="text-[24px] sm:text-[22px] font-medium tracking-tight leading-none">
      {value}
    </div>
    <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-1.5 uppercase tracking-wider">
      {label}
    </div>
  </div>
);

export default function StatsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [datasets, setDatasets] = useState<Model[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [velocity, setVelocity] = useState<{ week: string; dl: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mRes, dRes, pRes] = await Promise.all([
          fetchModels(),
          fetchDatasets(),
          fetchPapers(),
        ]);
        if (cancelled) return;
        const m = mRes?.data || [];
        const d = dRes?.data || [];
        const p = pRes?.data || [];
        setModels(m);
        setDatasets(d);
        setPapers(p);

        const byWeek = new Map<string, number>();
        const top = m.slice(0, 25);
        for (const mi of top) {
          const points = (mi.sparkline || []) as SparkPoint[];
          for (const pt of points) {
            byWeek.set(pt.week, (byWeek.get(pt.week) ?? 0) + (pt.dl ?? 0));
          }
        }
        const sortedWeeks = [...byWeek.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(-8)
          .map(([week, dl]) => ({ week, dl }));
        setVelocity(sortedWeeks);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const modelsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of models) {
      const key = m.badge || "Other";
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([k, v]) => ({ type: TYPE_LABEL[k] ?? k, key: k, value: v }))
      .sort((a, b) => b.value - a.value);
  }, [models]);

  const datasetsByLang = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of datasets) {
      const langs = d.langs && d.langs.length > 0 ? d.langs : ["other"];
      for (const l of langs) {
        counts[l] = (counts[l] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([k, v]) => ({ lang: LANG_LABEL[k] ?? k, key: k, value: v }))
      .sort((a, b) => b.value - a.value);
  }, [datasets]);

  const topAuthors = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of papers) {
      for (const a of p.authors ?? []) {
        if (!a) continue;
        counts[a] = (counts[a] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [papers]);

  const topOrgs = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of models) {
      if (!m.org) continue;
      counts[m.org] = (counts[m.org] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [models]);

  const papersByYear = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of papers) {
      const d = p.published_date ? new Date(p.published_date) : null;
      const y = d && !isNaN(d.getTime()) ? String(d.getFullYear()) : "Unknown";
      counts[y] = (counts[y] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [papers]);

  const totalDl = useMemo(
    () => models.reduce((s, m) => s + (m.dl ?? m.downloads_monthly ?? 0), 0),
    [models]
  );
  const totalLikes = useMemo(() => models.reduce((s, m) => s + (m.likes ?? 0), 0), [models]);

  const chartColor = "#059669";
  const tooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e5e5",
    borderRadius: 8,
    fontSize: 11,
    padding: "6px 8px",
  } as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-600 dark:bg-emerald-500  border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5">
              stats
            </span>
            <span className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500">
              Ethiopian AI at a glance
            </span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-6 sm:pb-7 pt-3 sm:pt-4">
          <h1 className="text-[26px] sm:text-[28px] font-medium tracking-tight leading-tight">
            Ethiopian AI at a glance
          </h1>
          <p className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 max-w-xl">
            How Amharic, Oromo, Tigrinya and Ge&rsquo;ez NLP is growing across models, datasets and research.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-7">
            <StatNumber value={models.length} label="Models" />
            <StatNumber value={datasets.length} label="Datasets" />
            <StatNumber value={papers.length} label="Papers" />
            <StatNumber
              value={totalDl >= 1000 ? (totalDl / 1000).toFixed(1) + "k" : totalDl}
              label="Downloads / mo"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7 space-y-3 sm:space-y-2.5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-2.5">
          <ChartCard title="Models by type" subtitle="total across catalogue">
            <ResponsiveContainer>
              <BarChart data={modelsByType} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 10, fill: "#737373" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#737373" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#fafafa" }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {modelsByType.map((entry) => (
                    <Cell key={entry.key} fill={BC_COLOR[entry.key] ?? chartColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Datasets by language" subtitle="all tagged languages">
            <ResponsiveContainer>
              <BarChart data={datasetsByLang} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="lang"
                  tick={{ fontSize: 10, fill: "#737373" }}
                  axisLine={{ stroke: "#e5e5e5" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#737373" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "#fafafa" }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill={chartColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title="Download velocity"
          subtitle="last 8 weeks · total across top 25 models"
          height={220}
        >
          <ResponsiveContainer>
            <AreaChart data={velocity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#737373" }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="dl"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#velocityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-2.5">
          <ChartCard title="Most prolific authors" subtitle="top 5 by paper count">
            <div className="space-y-2.5 pt-1">
              {topAuthors.length === 0 && (
                <div className="text-neutral-400 dark:text-neutral-500 text-[12px] py-6 text-center">No data</div>
              )}
              {topAuthors.map((a, i) => {
                const max = topAuthors[0]?.count || 1;
                const pct = Math.round((a.count / max) * 100);
                return (
                  <div key={a.name}>
                    <div className="flex items-center justify-between text-[12px] sm:text-[11px] mb-1">
                      <span className="text-neutral-900 dark:text-neutral-100 truncate pr-2 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 w-4 shrink-0">{i + 1}</span>
                        <span className="truncate">{a.name}</span>
                      </span>
                      <span className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0">
                        {a.count} {a.count === 1 ? "paper" : "papers"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Most prolific orgs" subtitle="top 5 by model count">
            <div className="space-y-2.5 pt-1">
              {topOrgs.length === 0 && (
                <div className="text-neutral-400 dark:text-neutral-500 text-[12px] py-6 text-center">No data</div>
              )}
              {topOrgs.map((o, i) => {
                const max = topOrgs[0]?.count || 1;
                const pct = Math.round((o.count / max) * 100);
                return (
                  <div key={o.name}>
                    <div className="flex items-center justify-between text-[12px] sm:text-[11px] mb-1">
                      <span className="text-neutral-900 dark:text-neutral-100 truncate pr-2 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 w-4 shrink-0">{i + 1}</span>
                        <span className="truncate">{o.name}</span>
                      </span>
                      <span className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 shrink-0">
                        {o.count} {o.count === 1 ? "model" : "models"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Papers by year" subtitle="Ethiopian NLP research">
          <ResponsiveContainer>
            <BarChart data={papersByYear} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: "#737373" }}
                axisLine={{ stroke: "#e5e5e5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#737373" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip cursor={{ fill: "#fafafa" }} contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={chartColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {loading && (
          <div className="text-center font-mono text-[10px] text-neutral-400 dark:text-neutral-500 py-2">loading…</div>
        )}
      </main>
    </div>
  );
}