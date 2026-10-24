"use client";

import { format, parseISO } from "date-fns";
import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";

import { formatNumberShort } from "@/shared/lib/utils/format-number";

const chartConfig = {
  downloads: {
    label: "Downloads / day",
    colors: {
      light: ["#2b7fff"],
      dark: ["#51a2ff"],
    },
  },
} satisfies ChartConfig;

function dayLabel(value: string): string {
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return value.slice(5);
  }
}

interface ModelDownloadsChartProps {
  points: number[];
  timestamps?: string[];
  projectId?: string;
  className?: string;
}

export default function ModelDownloadsChart({
  points,
  timestamps = [],
  projectId,
  className,
}: ModelDownloadsChartProps) {
  const rows = points.map((value, i) => ({
    date: timestamps[i] ?? `Day ${i + 1}`,
    downloads: value,
  }));

  const latest = points[points.length - 1] ?? 0;
  const first = points[0] ?? 0;
  const change =
    first > 0 ? Math.round(((latest - first) / first) * 100) : null;

  return (
    <div className="rounded-[18px] border border-muted-black-stroke bg-white px-5 pt-5 pb-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3
            className="text-[15px] text-primary tracking-[-0.01em]"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Download history
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Daily downloads across the last {points.length} snapshots
          </p>
        </div>
        <div className="flex items-baseline gap-3 text-xs tabular-nums">
          <span className="text-muted-foreground">
            now{" "}
            <span className="font-medium text-primary">
              {formatNumberShort(latest)}
            </span>
            /day
          </span>
          {change !== null && (
            <span
              className={
                change >= 0
                  ? "font-medium text-emerald-600"
                  : "font-medium text-red-600"
              }
            >
              {change >= 0 ? "+" : ""}
              {change}%
            </span>
          )}
          {projectId && (
            <a
              href={`/compare?models=${projectId}`}
              className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              Compare →
            </a>
          )}
        </div>
      </div>

      <EChartsAreaChart
        data={rows}
        config={chartConfig}
        xDataKey="date"
        curveType="smooth"
        className={className ?? "mt-2 h-52 w-full"}
      >
        <EChartsAreaChart.Grid />
        <EChartsAreaChart.XAxis
          dataKey="date"
          tickFormatter={(value) => dayLabel(value)}
        />
        <EChartsAreaChart.YAxis
          tickFormatter={(value) => formatNumberShort(value)}
        />
        <EChartsAreaChart.Tooltip />
        <EChartsAreaChart.Area dataKey="downloads" variant="gradient">
          <EChartsAreaChart.Dot variant="border" />
          <EChartsAreaChart.ActiveDot variant="colored-border" />
        </EChartsAreaChart.Area>
      </EChartsAreaChart>
    </div>
  );
}
