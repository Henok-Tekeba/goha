"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useTheme } from "next-themes";
import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";

import { getGrowthHistory } from "@/shared/lib/local-data.client";

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
  className,
}: {
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const { data, isLoading } = useQuery({
    queryKey: ["ecosystem", "growth"],
    queryFn: ({ signal }) => withSignal(getGrowthHistory(), signal),
  });

  return (
    <EChartsAreaChart
      key={resolvedTheme}
      data={(data?.data ?? []) as unknown as Record<string, unknown>[]}
      config={chartConfig}
      xDataKey="date"
      curveType="smooth"
      className={className}
      isLoading={isLoading}
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

/* Same rationale as the ecosystem hooks: the loader memoizes a single
   same-origin JSON fetch, so the AbortSignal is intentionally not wired. */
function withSignal<T>(promise: Promise<T>, _signal?: AbortSignal): Promise<T> {
  return promise;
}
