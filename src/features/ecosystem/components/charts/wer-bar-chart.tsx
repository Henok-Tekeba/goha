"use client";

import { useTheme } from "next-themes";
import {
  type ChartConfig,
  EChartsBarChart,
} from "@/components/evilcharts/charts/echarts-bar-chart";

import type { LeaderboardRow } from "../../types/ecosystem.types";

const chartConfig = {
  wer: {
    label: "Word Error Rate",
    colors: {
      light: ["#2b7fff"],
      dark: ["#51a2ff"],
    },
  },
} satisfies ChartConfig;

export default function WerBarChart({
  rows,
  className,
}: {
  rows: LeaderboardRow[];
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const data = rows
    .filter((row) => row.metricType === "wer" && row.value != null)
    .slice(0, 12)
    .map((row) => ({
      model: `${row.model} · ${row.org}`,
      wer: Math.round((row.value ?? 0) * 100) / 100,
    }));

  return (
    <EChartsBarChart
      key={resolvedTheme}
      data={data}
      config={chartConfig}
      layout="horizontal"
      xDataKey="model"
      className={className}
    >
      <EChartsBarChart.Grid />
      <EChartsBarChart.XAxis dataKey="wer" hideDots />
      <EChartsBarChart.YAxis dataKey="model" hideDots />
      <EChartsBarChart.Tooltip position="fixed" />
      <EChartsBarChart.Bar dataKey="wer" radius={6} enableHoverHighlight />
    </EChartsBarChart>
  );
}
