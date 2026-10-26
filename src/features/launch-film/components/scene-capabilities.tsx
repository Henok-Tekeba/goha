"use client";

import type { ReactNode } from "react";
import {
  type ChartConfig,
  EChartsBarChart,
} from "@/components/evilcharts/charts/echarts-bar-chart";

import { C, easeInOutCubic, easeOutQuint, seg } from "../lib/film";
import { filmWerRows } from "../lib/film-data";
import { FilmChart } from "./film-chart";
import { GapsRadar } from "./gaps-radar";
import { SvgLineageGraph } from "./svg-lineage-graph";

/* Ge'ez numerals — the three capability beats are a real sequence. */
const BEAT_NUMERALS = ["፩", "፪", "፫"];

const BEATS = [
  { start: 12.0, end: 13.533, caption: "Compare models" },
  { start: 13.533, end: 15.067, caption: "Trace model lineage" },
  { start: 15.067, end: 16.6, caption: "See what's missing" },
] as const;

/** Shared caption treatment for the three beats, bottom-center. */
function BeatCaption({ t, beat }: { t: number; beat: (typeof BEATS)[number] }) {
  const index = BEATS.indexOf(beat);
  const p = easeOutQuint(seg(t, beat.start + 0.1, beat.start + 0.42));
  if (p <= 0) return null;
  return (
    <div
      className="absolute flex items-center justify-center gap-4 whitespace-nowrap"
      style={{
        left: "50%",
        top: 952,
        transform: `translate(-50%, ${(1 - p) * 16}px)`,
        opacity: Math.min(1, p * 3),
      }}
    >
      <span
        className="text-[26px] leading-none"
        style={{
          color: C.accent,
          fontFamily:
            "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif",
        }}
      >
        {BEAT_NUMERALS[index]}
      </span>
      <span
        className="font-semibold text-[42px] leading-none"
        style={{ color: C.ink, letterSpacing: "0.01em" }}
      >
        {beat.caption}
      </span>
    </div>
  );
}

/* Real records from the index — language, size, and exactly what the
   leaderboard publishes for each, in plain words. */
const COMPARE_CARDS = [
  {
    name: "hohe-asr-amharic",
    owner: "snapwre",
    lang: "Amharic",
    glyph: "አ",
    size: "606M",
    evalBadge: "16.0% wrong · FLEURS test",
    evalRanked: true,
  },
  {
    name: "whisper-amharic-small-v2",
    owner: "chappM",
    lang: "Amharic",
    glyph: "አ",
    size: "242M",
    evalBadge: "69.0% wrong · Common Voice",
    evalRanked: true,
  },
  {
    name: "geez-asr",
    owner: "Samuael",
    lang: "Ge'ez",
    glyph: "ግ",
    size: "318M",
    evalBadge: "no real test · self-reported",
    evalRanked: false,
  },
] as const;

function Row({
  label,
  t,
  delay,
  children,
}: {
  label: string;
  t: number;
  delay: number;
  children: ReactNode;
}) {
  const p = seg(t, delay, delay + 0.3);
  if (p <= 0) return null;
  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{
        opacity: Math.min(1, p * 2),
        transform: `translateX(${(1 - p) * -8}px)`,
      }}
    >
      <span
        className="font-medium text-[14px] tracking-[0.03em]"
        style={{ color: "rgba(0,0,0,0.45)" }}
      >
        {label}
      </span>
      <span className="flex min-w-0 items-center">{children}</span>
    </div>
  );
}

/* The site's own WER chart config — wer-bar-chart.tsx. */
const WER_CONFIG = {
  wer: {
    label: "Word Error Rate",
    colors: { light: ["#2b7fff"], dark: ["#51a2ff"] },
  },
} satisfies ChartConfig;

/* The WER bars mount on cue so evilcharts' staggered grow-in plays fully
   visible — the same intro the /leaderboard WER card gives you. */
const WER_AT = 12.35;
const WER_LEFT = 260;
const WER_TOP = 492;
const WER_W = 1400;
const WER_H = 396;

function CompareBeat({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      {COMPARE_CARDS.map((card, i) => {
        const p = easeOutQuint(seg(t, 12.1 + i * 0.14, 12.7 + i * 0.14));
        if (p <= 0) return null;
        const rowDelay = 12.4 + i * 0.14;
        return (
          <div
            key={card.name}
            className="absolute rounded-2xl"
            style={{
              left: [480, 960, 1440][i],
              top: 260,
              width: 400,
              height: 300,
              transform: `translate(-50%, calc(-50% + ${(1 - p) * 26}px))`,
              opacity: Math.min(1, p * 2.5),
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              willChange: "transform, opacity",
            }}
          >
            <div className="flex h-full flex-col px-8 py-7">
              <div
                className="truncate font-semibold text-[23px] leading-tight"
                style={{ color: C.ink }}
              >
                {card.name}
              </div>
              <div className="mt-1 text-[16px]" style={{ color: C.dim }}>
                {card.owner}
              </div>

              <div
                className="mt-5 h-px w-full"
                style={{ background: C.lineFaint }}
              />

              <div className="mt-5 space-y-4">
                <Row label="Language" t={t} delay={rowDelay}>
                  <span
                    className="mr-2 text-[18px] leading-none"
                    style={{
                      color: C.ink,
                      fontFamily:
                        "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif",
                    }}
                  >
                    {card.glyph}
                  </span>
                  <span className="text-[18px]" style={{ color: C.ink }}>
                    {card.lang}
                  </span>
                </Row>
                <Row label="Parameters" t={t} delay={rowDelay + 0.1}>
                  <span
                    className="text-[18px]"
                    style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}
                  >
                    {card.size}
                  </span>
                </Row>
                <Row label="Eval" t={t} delay={rowDelay + 0.2}>
                  <span
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[15px] leading-none"
                    style={{
                      border: `1px solid ${card.evalRanked ? "rgba(43,127,255,0.5)" : "rgba(0,0,0,0.18)"}`,
                      color: card.evalRanked ? C.accent : C.dim,
                    }}
                  >
                    {card.evalBadge}
                  </span>
                </Row>
              </div>
            </div>
          </div>
        );
      })}

      {/* Comparison highlight sweeping across the trio */}
      {(() => {
        const sweep = easeInOutCubic(seg(t, 12.85, 13.45));
        if (sweep <= 0 || sweep >= 1) return null;
        return (
          <div
            className="absolute"
            style={{
              left: 300 + sweep * 1320,
              top: 118,
              width: 2,
              height: 286,
              background: C.accent,
              opacity: 0.55,
            }}
          />
        );
      })()}

      {/* Real leaderboard context under the cards */}
      <div
        className="absolute flex items-baseline justify-between"
        style={{
          left: WER_LEFT,
          top: 448,
          width: WER_W,
          opacity: seg(t, 12.45, 12.75),
        }}
      >
        <span
          className="font-semibold text-[24px] leading-none"
          style={{ color: C.ink, letterSpacing: "-0.01em" }}
        >
          Words AI gets wrong
        </span>
        <span
          className="font-medium text-[17px] tracking-[0.04em]"
          style={{ color: C.dim }}
        >
          word error rate · lower is better
        </span>
      </div>

      {/* The real WER ranking — the same evilcharts bar chart and leaderboard
          rows the /leaderboard ASR section renders */}
      {t >= WER_AT && (
        <FilmChart left={WER_LEFT} top={WER_TOP} width={WER_W} height={WER_H}>
          <EChartsBarChart
            data={filmWerRows}
            config={WER_CONFIG}
            renderer="svg"
            layout="horizontal"
            xDataKey="wer"
            className="h-[198px] w-full"
          >
            <EChartsBarChart.Grid />
            <EChartsBarChart.XAxis
              dataKey="wer"
              tickFormatter={(value) => `${value}%`}
              hideDots
            />
            <EChartsBarChart.YAxis dataKey="model" hideDots />
            <EChartsBarChart.Bar dataKey="wer" radius={6} />
          </EChartsBarChart>
        </FilmChart>
      )}

      <BeatCaption t={t} beat={BEATS[0]} />
    </div>
  );
}

function LineageBeat({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      <SvgLineageGraph t={t} />
      <BeatCaption t={t} beat={BEATS[1]} />
    </div>
  );
}

function GapsBeat({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      <GapsRadar t={t} />
      <BeatCaption t={t} beat={BEATS[2]} />
    </div>
  );
}

/**
 * Scene 4 — 00:12–00:16.6 — Three capabilities, unhurried beats.
 * Compare → lineage → gaps, each a self-contained micro-scene with a soft
 * crossfade.
 */
export function SceneCapabilities({ t }: { t: number }) {
  const fade = 0.3;
  return (
    <div className="absolute inset-0">
      {BEATS.map((beat, i) => {
        if (t < beat.start - fade || t > beat.end + fade) return null;
        const inP = seg(t, beat.start - fade, beat.start);
        const outP = seg(t, beat.end, beat.end + fade);
        const opacity = Math.min(inP, 1 - outP);
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{ opacity, willChange: "opacity" }}
          >
            {i === 0 && <CompareBeat t={t} />}
            {i === 1 && <LineageBeat t={t} />}
            {i === 2 && <GapsBeat t={t} />}
          </div>
        );
      })}
    </div>
  );
}
