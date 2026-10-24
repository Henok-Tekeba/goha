"use client";

import { useMemo } from "react";
import {
  type ChartConfig,
  EChartsPieChart,
} from "@/components/evilcharts/charts/echarts-pie-chart";

import { useEcosystemStatsQuery } from "../../hooks/ecosystem.queries";

const chartConfig = {
  Models: {
    label: "Models",
    colors: { light: ["#2b7fff"], dark: ["#51a2ff"] },
  },
  Datasets: {
    label: "Datasets",
    colors: { light: ["#193cb8"], dark: ["#8ec5ff"] },
  },
  Papers: {
    label: "Papers",
    colors: { light: ["#0e7f6e"], dark: ["#2dd4bf"] },
  },
  Spaces: {
    label: "Spaces",
    colors: { light: ["#b45309"], dark: ["#fbbf24"] },
  },
  Repos: {
    label: "Repos",
    colors: { light: ["#6366f1"], dark: ["#a5b4fc"] },
  },
} satisfies ChartConfig;

export default function EcosystemDonutChart({
  className,
}: {
  className?: string;
}) {
  const { data } = useEcosystemStatsQuery();

  const rows = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Models", value: data.counts.models },
      { name: "Datasets", value: data.counts.datasets },
      { name: "Papers", value: data.counts.papers },
      { name: "Spaces", value: data.counts.spaces },
      { name: "Repos", value: data.counts.repos },
    ].filter((row) => row.value > 0);
  }, [data]);

  if (rows.length === 0) return null;

  return (
    <EChartsPieChart
      data={rows}
      config={chartConfig}
      dataKey="value"
      nameKey="name"
      className={className}
    >
      <EChartsPieChart.Pie
        innerRadius="58%"
        outerRadius="88%"
        cornerRadius={6}
        paddingAngle={2}
        isClickable
      />
      <EChartsPieChart.Tooltip />
      <EChartsPieChart.Legend align="center" verticalAlign="bottom" />
    </EChartsPieChart>
  );
}
