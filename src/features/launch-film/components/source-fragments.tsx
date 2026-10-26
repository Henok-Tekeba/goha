"use client";

import type { ComponentType } from "react";
import {
  LuAudioWaveform,
  LuBuilding2,
  LuDatabase,
  LuFileText,
} from "react-icons/lu";

import { C, easeOutQuint, lerp, STAGE_H, STAGE_W, seg } from "../lib/film";

export type IconType = ComponentType<{ size?: number; color?: string }>;

/**
 * The four source fragments are shared by Scene 1 (scattered) and Scene 2
 * (assembled) so the transition is one continuous interpolation — the same
 * nodes move from disorder into a clean index. No invented stats: the labels
 * name exactly what goha indexes and where it comes from.
 */
export type SourceFragment = {
  id: string;
  label: string;
  sub: string;
  icon: IconType;
  scatter: { x: number; y: number; r: number };
  enterFrom: { x: number; y: number };
  slot: { x: number; y: number };
  phase: number;
};

export const SOURCE_FRAGMENTS: SourceFragment[] = [
  {
    id: "models",
    label: "Models",
    sub: "Hugging Face",
    icon: LuAudioWaveform,
    scatter: { x: 640, y: 340, r: -4 },
    enterFrom: { x: -320, y: -260 },
    slot: { x: 430, y: 330 },
    phase: 0.4,
  },
  {
    id: "datasets",
    label: "Datasets",
    sub: "GitHub + Hugging Face",
    icon: LuDatabase,
    scatter: { x: 1170, y: 300, r: 3 },
    enterFrom: { x: 360, y: -240 },
    slot: { x: 430, y: 452 },
    phase: 1.7,
  },
  {
    id: "research",
    label: "Research",
    sub: "arXiv",
    icon: LuFileText,
    scatter: { x: 660, y: 700, r: 3.5 },
    enterFrom: { x: -340, y: 300 },
    slot: { x: 430, y: 574 },
    phase: 2.9,
  },
  {
    id: "orgs",
    label: "Organizations",
    sub: "The public record",
    icon: LuBuilding2,
    scatter: { x: 1150, y: 690, r: -3 },
    enterFrom: { x: 340, y: 320 },
    slot: { x: 430, y: 696 },
    phase: 4.1,
  },
];

const CARD_W = 340;
const CARD_H = 96;

/**
 * Renders the four cards.
 *   t < 2            — scattered pose (Scene 1), gentle idle drift
 *   t >= 2 (Scene 2) — continuous interpolation into the aligned index slots
 */
export function SourceFragments({ t }: { t: number }) {
  const assembled = t >= 2;
  return (
    <>
      {SOURCE_FRAGMENTS.map((f, i) => {
        let x = f.scatter.x;
        let y = f.scatter.y;
        let rot = f.scatter.r;
        let scale = 1;
        let opacity = 1;

        if (!assembled) {
          const p = easeOutQuint(seg(t, 0.14 + i * 0.13, 0.64 + i * 0.13));
          x = lerp(f.scatter.x + f.enterFrom.x, f.scatter.x, p);
          y = lerp(f.scatter.y + f.enterFrom.y, f.scatter.y, p);
          rot = lerp(f.scatter.r * 2.2, f.scatter.r, p);
          opacity = Math.min(1, p * 2.2);
          /* Deterministic idle drift — a fixed phase per card. */
          x += Math.sin(t * 1.6 + f.phase) * 3;
          y += Math.cos(t * 1.35 + f.phase) * 2.4;
        } else {
          const p = easeOutQuint(seg(t, 2.05 + i * 0.07, 2.78 + i * 0.07));
          x = lerp(f.scatter.x, f.slot.x, p);
          y = lerp(f.scatter.y, f.slot.y, p);
          rot = lerp(f.scatter.r, 0, p);
          /* Scale stays 1 — Scene 1's cards are at scale 1, and these are the
             same nodes, so the handoff at t=2.0 must be pixel-identical. */
          scale = 1;
        }

        const Icon = f.icon;
        return (
          <div
            key={f.id}
            className="absolute"
            style={{
              left: x,
              top: y,
              width: CARD_W,
              height: CARD_H,
              opacity,
              transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
              willChange: "transform, opacity",
            }}
          >
            <div
              className="flex h-full w-full items-center gap-4 rounded-2xl px-6"
              style={{
                background: C.panel,
                border: `1px solid ${C.panelLine}`,
              }}
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full"
                style={{ border: `1px solid ${C.line}` }}
              >
                <Icon size={22} color={C.ink} />
              </div>
              <div className="min-w-0">
                <div
                  className="truncate font-semibold text-[22px] leading-tight"
                  style={{ color: C.ink }}
                >
                  {f.label}
                </div>
                <div
                  className="truncate text-[16px] leading-snug"
                  style={{ color: C.dim }}
                >
                  {f.sub}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

/** Small disconnected nodes + dashed paths that never complete (Scene 1). */
export function ScatteredNodes({ t }: { t: number }) {
  const dots: Array<[number, number]> = [
    [870, 470],
    [960, 520],
    [1050, 468],
    [900, 565],
    [1015, 560],
    [962, 420],
  ];
  const paths = [
    "M 870 470 C 900 480, 930 505, 960 520",
    "M 960 520 C 990 505, 1020 485, 1050 468",
    "M 900 565 C 940 568, 975 565, 1015 560",
    "M 870 470 C 900 545, 975 555, 1015 560",
  ];

  return (
    <svg
      className="absolute"
      style={{ left: 0, top: 0 }}
      width={STAGE_W}
      height={STAGE_H}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      aria-hidden
    >
      {paths.map((d, i) => {
        const p = seg(t, 0.7 + i * 0.1, 1.2 + i * 0.1);
        const out = 1 - seg(t, 1.35 + i * 0.08, 1.8 + i * 0.08);
        if (p <= 0 || out <= 0) return null;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            pathLength={1}
            stroke={C.line}
            strokeWidth={1.2}
            strokeDasharray="4 9"
            strokeDashoffset={1 - p}
            opacity={Math.min(1, p * 2) * out}
          />
        );
      })}
      {dots.map(([cx, cy], i) => {
        const p = seg(t, 0.55 + i * 0.06, 0.85 + i * 0.06);
        const out = 1 - seg(t, 1.55, 1.95);
        if (p <= 0 || out <= 0) return null;
        const s = 0.4 + 0.6 * p;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={4.5}
            fill={C.ink}
            opacity={0.55 * out}
            transform={`translate(${cx * (1 - s)} ${cy * (1 - s)}) scale(${s})`}
          />
        );
      })}
    </svg>
  );
}
