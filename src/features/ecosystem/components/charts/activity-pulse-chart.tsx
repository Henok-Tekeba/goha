"use client";

import { useMemo } from "react";
import {
  type ChartConfig,
  EChartsBarChart,
} from "@/components/evilcharts/charts/echarts-bar-chart";

import { useActivityQuery } from "../../hooks/ecosystem.queries";

const chartConfig = {
  events: {
    label: "Events",
    colors: {
      light: ["#2b7fff"],
      dark: ["#51a2ff"],
    },
  },
} satisfies ChartConfig;

const DAY_MS = 24 * 60 * 60 * 1000;

export default function ActivityPulseChart({
  className,
  days = 30,
}: {
  className?: string;
  days?: number;
}) {
  const { data } = useActivityQuery();

  const rows = useMemo(() => {
    const now = Date.now();
    const buckets = new Map<string, number>();
    const fmt = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    });
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(
        Math.floor((now - i * DAY_MS) / DAY_MS) * DAY_MS
      );
      buckets.set(fmt.format(dayStart), 0);
    }
    for (const event of data ?? []) {
      if (!event.at) continue;
      const age = now - new Date(event.at).getTime();
      if (age > days * DAY_MS) continue;
      const key = fmt.format(new Date(event.at));
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return [...buckets.entries()].map(([day, events]) => ({ day, events }));
  }, [data, days]);

  return (
    <EChartsBarChart
      data={rows}
      config={chartConfig}
      xDataKey="day"
      className={className}
      enableMaxValueHighlight
    >
      <EChartsBarChart.Grid />
      <EChartsBarChart.XAxis
        dataKey="day"
        tickFormatter={(value, index) => (index % 5 === 0 ? value : "")}
        hideDots
      />
      <EChartsBarChart.YAxis hideDots />
      <EChartsBarChart.Tooltip position="fixed" />
      <EChartsBarChart.Bar dataKey="events" radius={4} />
    </EChartsBarChart>
  );
}
