"use client";

import { useMemo } from "react";
import {
  type ChartConfig,
  EChartsRadarChart,
} from "@/components/evilcharts/charts/echarts-radar-chart";

import type { OrgRadarAxis } from "../../types/ecosystem.types";

/* Rows are the angle categories (one per axis); the org is the single series.
   Values are normalized to 0–100 against the ecosystem max per axis, so the
   polygon shows the org's footprint *shape* rather than raw magnitudes. */
export default function OrgRadarChart({
  axes,
  className,
}: {
  axes: OrgRadarAxis[];
  className?: string;
}) {
  const data = useMemo(
    () =>
      axes.map((a) => ({
        axis: a.label,
        value: a.max > 0 ? Math.max(2, Math.round((a.value / a.max) * 100)) : 0,
      })),
    [axes]
  );

  const chartConfig = {
    footprint: {
      label: "Footprint",
      colors: {
        light: ["#2b7fff"],
        dark: ["#51a2ff"],
      },
    },
  } satisfies ChartConfig;

  return (
    <EChartsRadarChart data={data} config={chartConfig} className={className}>
      <EChartsRadarChart.PolarGrid />
      <EChartsRadarChart.PolarAngleAxis dataKey="axis" />
      <EChartsRadarChart.Tooltip />
      <EChartsRadarChart.Radar
        dataKey="value"
        variant="filled"
        fillOpacity={0.22}
      />
    </EChartsRadarChart>
  );
}
