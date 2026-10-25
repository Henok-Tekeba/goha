"use client";

import { format, parseISO } from "date-fns";
import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";

import type { TopModelHistoryPayload } from "../../types/ecosystem.types";

/* per-series stroke palette — the OST blue ramp, darkened per rank */
const RANK_COLORS: { light: string; dark: string }[] = [
  { light: "#2b7fff", dark: "#51a2ff" },
  { light: "#6aa6ff", dark: "#8ec5ff" },
  { light: "#193cb8", dark: "#93b8ff" },
  { light: "#0e7f6e", dark: "#2dd4bf" },
  { light: "#b45309", dark: "#fbbf24" },
];

function buildConfig(
  series: { id: string; name: string }[] | undefined
): ChartConfig {
  const config: Record<string, unknown> = {};
  (series ?? []).forEach((s, i) => {
    const colors = RANK_COLORS[i % RANK_COLORS.length];
    config[s.id] = {
      label: s.name,
      colors: { light: [colors.light], dark: [colors.dark] },
    };
  });
  return config as ChartConfig;
}

export default function TopModelsChart({
  payload,
  className,
}: {
  payload: TopModelHistoryPayload;
  className?: string;
}) {
  return (
    <EChartsAreaChart
      data={payload.rows}
      config={buildConfig(payload.series)}
      xDataKey="date"
      curveType="smooth"
      className={className}
    >
      <EChartsAreaChart.Grid />
      <EChartsAreaChart.XAxis
        dataKey="date"
        tickFormatter={(value) => format(parseISO(value), "MMM d")}
      />
      <EChartsAreaChart.YAxis
        tickFormatter={(value) => value.toLocaleString("en")}
      />
      <EChartsAreaChart.Brush
        formatLabel={(value) => {
          try {
            return format(parseISO(value), "MMM d");
          } catch {
            return String(value);
          }
        }}
      />
      <EChartsAreaChart.Legend isClickable />
      <EChartsAreaChart.Tooltip />
      {payload.series.map((s) => (
        <EChartsAreaChart.Area
          key={s.id}
          dataKey={s.id}
          variant="none"
          isClickable
        >
          <EChartsAreaChart.Dot variant="border" />
          <EChartsAreaChart.ActiveDot variant="colored-border" />
        </EChartsAreaChart.Area>
      ))}
    </EChartsAreaChart>
  );
}
