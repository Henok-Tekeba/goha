"use client";

import { format, parseISO } from "date-fns";
import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";

import type { GrowthPoint } from "../../types/ecosystem.types";

const chartConfig = {
  models: {
    label: "Models",
    colors: {
      light: ["#2b7fff"],
      dark: ["#51a2ff"],
    },
  },
  datasets: {
    label: "Datasets",
    colors: {
      light: ["#193cb8"],
      dark: ["#8ec5ff"],
    },
  },
} satisfies ChartConfig;

export default function EcosystemGrowthChart({
  data,
  className,
}: {
  data: GrowthPoint[];
  className?: string;
}) {
  return (
    <EChartsAreaChart
      data={data as unknown as Record<string, unknown>[]}
      config={chartConfig}
      xDataKey="date"
      curveType="smooth"
      className={className}
      defaultSelectedDataKey={null}
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
      <EChartsAreaChart.Area dataKey="models" variant="gradient" isClickable>
        <EChartsAreaChart.Dot variant="border" />
        <EChartsAreaChart.ActiveDot variant="colored-border" />
      </EChartsAreaChart.Area>
      <EChartsAreaChart.Area dataKey="datasets" variant="gradient" isClickable>
        <EChartsAreaChart.Dot variant="border" />
        <EChartsAreaChart.ActiveDot variant="colored-border" />
      </EChartsAreaChart.Area>
    </EChartsAreaChart>
  );
}
