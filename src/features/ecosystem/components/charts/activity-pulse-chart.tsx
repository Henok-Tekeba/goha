"use client";

import { useMemo } from "react";
import {
  type ChartConfig,
  EChartsBarChart,
} from "@/components/evilcharts/charts/echarts-bar-chart";

import { buildActivityPulseRows } from "../../lib/activity-pulse";
import type { ActivityEvent } from "../../types/ecosystem.types";

const chartConfig = {
  events: {
    label: "Events",
    colors: {
      light: ["#2b7fff"],
      dark: ["#51a2ff"],
    },
  },
} satisfies ChartConfig;

export default function ActivityPulseChart({
  events,
  builtAt,
  className,
  days = 30,
}: {
  events: ActivityEvent[];
  builtAt: string;
  className?: string;
  days?: number;
}) {
  const rows = useMemo(
    () => buildActivityPulseRows(events, new Date(builtAt), days),
    [events, builtAt, days]
  );

  return (
    <EChartsBarChart
      data={rows}
      config={chartConfig}
      xDataKey="label"
      className={className}
      enableMaxValueHighlight
    >
      <EChartsBarChart.Grid />
      <EChartsBarChart.XAxis
        dataKey="label"
        tickFormatter={(value, index) => (index % 5 === 0 ? value : "")}
        hideDots
      />
      <EChartsBarChart.YAxis hideDots />
      <EChartsBarChart.Tooltip position="fixed" />
      <EChartsBarChart.Bar dataKey="events" radius={4} />
    </EChartsBarChart>
  );
}
