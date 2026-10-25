"use client";

import { useMemo } from "react";
import {
  type ChartConfig,
  EChartsBarChart,
} from "@/components/evilcharts/charts/echarts-bar-chart";

import { useActivityQuery } from "../../hooks/ecosystem.queries";
import { buildActivityPulseRows } from "../../lib/activity-pulse";

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
  className,
  days = 30,
}: {
  className?: string;
  days?: number;
}) {
  const { data } = useActivityQuery();
  const rows = useMemo(
    () => buildActivityPulseRows(data ?? [], new Date(), days),
    [data, days]
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
