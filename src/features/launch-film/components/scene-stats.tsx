"use client";

import { format, parseISO } from "date-fns";
import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";

import { C, seg } from "../lib/film";
import { filmGrowth } from "../lib/film-data";
import { AnimatedNumber } from "./animated-number";
import { FilmChart } from "./film-chart";

/* Real snapshot figures — public/data/stats.json. */
const STATS = [
  { value: 180, label: "Models", x: 360 },
  { value: 211, label: "Datasets", x: 760 },
  { value: 75, label: "Research papers", x: 1160 },
  { value: 185, label: "Organizations", x: 1560 },
] as const;

/* The site's own growth-chart series config — ecosystem-growth-chart.tsx. */
const GROWTH_CONFIG = {
  models: {
    label: "Models",
    colors: { light: ["#2b7fff"], dark: ["#51a2ff"] },
  },
  datasets: {
    label: "Datasets",
    colors: { light: ["#193cb8"], dark: ["#8ec5ff"] },
  },
} satisfies ChartConfig;

/* The chart mounts on cue so evilcharts' own left-to-right draw-in plays
   fully visible — the same intro the /leaderboard card gives you. */
const CHART_AT = 9.55;
const CHART_LEFT = 160;
const CHART_TOP = 478;
const CHART_W = 1600;
const CHART_H = 508;

/**
 * Scene 3 — 00:07.2–00:12 — The ecosystem, quantified.
 * Four unhurried count-ups from the live stats, then the site's real
 * ecosystem growth chart (public/data/growth.json, the exact evilcharts
 * area chart /leaderboard renders) drawing itself across 124 days.
 */
export function SceneStats({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      {/* Four big statistics, staggered */}
      {STATS.map((s, i) => {
        const start = 7.55 + i * 0.42;
        const p = seg(t, start, start + 0.05);
        const under = Math.min(1, seg(t, start + 0.68, start + 0.98));
        return (
          <div
            key={s.label}
            className="absolute flex flex-col items-center"
            style={{
              left: s.x,
              top: 168,
              transform: "translateX(-50%)",
              opacity: Math.min(1, p * 4),
            }}
          >
            <AnimatedNumber
              t={t}
              target={s.value}
              start={start}
              duration={1.0}
              className="font-extrabold text-[118px] leading-none"
              style={{ color: C.ink, letterSpacing: "-0.03em" }}
            />
            <div
              className="mt-4 font-medium text-[21px] tracking-[0.04em]"
              style={{ color: C.dim }}
            >
              {s.label}
            </div>
            <div
              className="mt-3.5 h-[2px] rounded-full"
              style={{
                width: 64 * under,
                background: C.accent,
                opacity: under,
              }}
            />
          </div>
        );
      })}

      {/* Chart caption, film-styled */}
      <div
        className="absolute flex items-baseline justify-between"
        style={{
          left: CHART_LEFT,
          top: 424,
          width: CHART_W,
          opacity: seg(t, 9.25, 9.55),
        }}
      >
        <span
          className="font-semibold text-[27px] leading-none"
          style={{ color: C.ink, letterSpacing: "-0.01em" }}
        >
          The index grows every day
        </span>
        <span
          className="font-medium text-[18px] tracking-[0.04em]"
          style={{ color: C.dim }}
        >
          models & datasets · straight from Hugging Face
        </span>
      </div>

      {/* The real chart — the same evilcharts area chart and data the
          /leaderboard "Ecosystem growth" card renders */}
      {t >= CHART_AT && (
        <FilmChart
          left={CHART_LEFT}
          top={CHART_TOP}
          width={CHART_W}
          height={CHART_H}
        >
          <EChartsAreaChart
            data={filmGrowth as unknown as Record<string, unknown>[]}
            config={GROWTH_CONFIG}
            renderer="svg"
            xDataKey="date"
            curveType="smooth"
            className="h-[254px] w-full"
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
            <EChartsAreaChart.Legend />
            <EChartsAreaChart.Area dataKey="models" variant="gradient">
              <EChartsAreaChart.Dot variant="border" />
            </EChartsAreaChart.Area>
            <EChartsAreaChart.Area dataKey="datasets" variant="gradient">
              <EChartsAreaChart.Dot variant="border" />
            </EChartsAreaChart.Area>
          </EChartsAreaChart>
        </FilmChart>
      )}
    </div>
  );
}
