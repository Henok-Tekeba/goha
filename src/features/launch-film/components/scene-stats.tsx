"use client";

import {
  type ChartConfig,
  EChartsPieChart,
} from "@/components/evilcharts/charts/echarts-pie-chart";

import { C, easeOutCubic, easeOutQuint, seg } from "../lib/film";
import { filmComposition, filmTopModels } from "../lib/film-data";
import { AnimatedNumber } from "./animated-number";
import { FilmChart } from "./film-chart";

/* Real snapshot figures — public/data/stats.json. */
const STATS = [
  { value: 180, label: "Models", x: 360 },
  { value: 211, label: "Datasets", x: 760 },
  { value: 75, label: "Research papers", x: 1160 },
  { value: 185, label: "Organizations", x: 1560 },
] as const;

/* The site's donut palette — ecosystem-donut-chart.tsx. */
const COMPOSITION_CONFIG = {
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
  Companies: {
    label: "Companies",
    colors: { light: ["#b45309"], dark: ["#fbbf24"] },
  },
} satisfies ChartConfig;

/* The donut mounts on cue; its slices then grow from zero driven by the
   film clock — a formation that plays even under OS reduced motion, and
   scrubs exactly with the timeline. */
const DONUT_AT = 9.6;
const DONUT_LEFT = 190;
const DONUT_TOP = 462;
const DONUT_W = 580;
const DONUT_H = 580;
const DONUT_SCALE = 1.5;
const SLICE_STAGGER = 0.18;
const SLICE_GROW = 0.85;

const LIST_LEFT = 1030;
const LIST_TOP = 512;
const LIST_W = 730;

/**
 * Scene 3 — 00:07.2–00:12 — The ecosystem, quantified.
 * Four count-ups from the live stats, a donut of the record composition
 * sweeping itself into being with the total counting up in its centre, and
 * the three most-used models with real download counts.
 */
export function SceneStats({ t }: { t: number }) {
  /* Slice values grow from 0; the centre total is their live sum, so the
     number and the ring always agree. */
  const slices = filmComposition.map((part, i) => {
    const p = easeOutCubic(
      seg(
        t,
        DONUT_AT + 0.05 + i * SLICE_STAGGER,
        DONUT_AT + 0.05 + i * SLICE_STAGGER + SLICE_GROW
      )
    );
    return { ...part, formed: Math.round(part.value * p) };
  });
  const formedTotal = slices.reduce((total, part) => total + part.formed, 0);
  const donutReady = t >= DONUT_AT;

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

      {/* Scene caption */}
      <div
        className="absolute flex items-baseline justify-between"
        style={{
          left: DONUT_LEFT,
          top: 420,
          width: 1600,
          opacity: seg(t, 9.25, 9.55),
        }}
      >
        <span
          className="font-semibold text-[27px] leading-none"
          style={{ color: C.ink, letterSpacing: "-0.01em" }}
        >
          Everything, in one index
        </span>
        <span
          className="font-medium text-[18px] tracking-[0.04em]"
          style={{ color: C.dim }}
        >
          live counts · rebuilt daily
        </span>
      </div>

      {/* The composition donut, forming slice by slice — the same
          evilcharts pie the site's donut renders, fed by stats.json */}
      {donutReady && (
        <FilmChart
          left={DONUT_LEFT}
          top={DONUT_TOP}
          width={DONUT_W}
          height={DONUT_H}
          scale={DONUT_SCALE}
        >
          <EChartsPieChart
            data={slices as unknown as Record<string, unknown>[]}
            config={COMPOSITION_CONFIG}
            dataKey="formed"
            nameKey="name"
            renderer="svg"
            animation={false}
            className="h-[387px] w-full"
          >
            <EChartsPieChart.Pie
              innerRadius="58%"
              outerRadius="88%"
              cornerRadius={6}
              paddingAngle={2}
            />
            <EChartsPieChart.Legend align="center" verticalAlign="bottom" />
          </EChartsPieChart>
        </FilmChart>
      )}

      {/* Live total in the donut's centre — counts up with the ring */}
      {donutReady && (
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: DONUT_LEFT + DONUT_W / 2,
            top: DONUT_TOP + DONUT_H / 2 - 34,
            transform: "translateX(-50%)",
            opacity: Math.min(1, seg(t, DONUT_AT + 0.1, DONUT_AT + 0.35) * 1.5),
          }}
        >
          <span
            className="font-extrabold text-[64px] tabular-nums leading-none"
            style={{ color: C.ink, letterSpacing: "-0.03em" }}
          >
            {formedTotal.toLocaleString("en")}
          </span>
          <span
            className="mt-2 font-medium text-[16px] tracking-[0.05em]"
            style={{ color: C.dim }}
          >
            project records
          </span>
        </div>
      )}

      {/* Most-used models — real download counts from the leaderboard data */}
      <div
        className="absolute"
        style={{ left: LIST_LEFT, top: LIST_TOP, width: LIST_W }}
      >
        <div
          className="font-medium text-[18px] tracking-[0.04em]"
          style={{ color: C.dim, opacity: seg(t, 10.25, 10.5) }}
        >
          Most used right now
        </div>
        {filmTopModels.map((model, i) => {
          const start = 10.45 + i * 0.18;
          const p = easeOutQuint(seg(t, start, start + 0.3));
          if (p <= 0) return null;
          return (
            <div
              key={model.id}
              className="flex items-baseline justify-between gap-6 border-b py-4 last:border-b-0"
              style={{
                borderColor: C.lineFaint,
                opacity: Math.min(1, p * 2),
                transform: `translateX(${(1 - p) * -10}px)`,
              }}
            >
              <span className="truncate text-[19px]" style={{ color: C.ink }}>
                {model.name}
                <span style={{ color: C.dim }}> · {model.org}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <AnimatedNumber
                  t={t}
                  target={model.dl}
                  start={start}
                  duration={0.9}
                  format={(value) => value.toLocaleString("en")}
                  className="font-bold text-[24px] tabular-nums leading-none"
                  style={{ color: C.ink }}
                />
                <span className="text-[15px]" style={{ color: C.dim }}>
                  downloads / mo
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
