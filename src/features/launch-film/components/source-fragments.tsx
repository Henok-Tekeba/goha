"use client";

import type { ComponentType } from "react";
import {
  LuAudioWaveform,
  LuBuilding2,
  LuDatabase,
  LuFileText,
  LuTrophy,
} from "react-icons/lu";

import {
  ASSEMBLE_AT,
  C,
  easeOutQuint,
  lerp,
  STAGE_H,
  STAGE_W,
  seg,
} from "../lib/film";

export type IconType = ComponentType<{ size?: number; color?: string }>;

/**
 * The five source fragments are shared by Scene 1 (scattered) and Scene 2
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
    scatter: { x: 620, y: 330, r: -4 },
    enterFrom: { x: -320, y: -260 },
    slot: { x: 430, y: 316 },
    phase: 0.4,
  },
  {
    id: "datasets",
    label: "Datasets",
    sub: "GitHub + Hugging Face",
    icon: LuDatabase,
    scatter: { x: 1190, y: 295, r: 3 },
    enterFrom: { x: 360, y: -240 },
    slot: { x: 430, y: 438 },
    phase: 1.6,
  },
  {
    id: "benchmarks",
    label: "Benchmarks",
    sub: "Published evaluations",
    icon: LuTrophy,
    scatter: { x: 950, y: 218, r: 2.5 },
    enterFrom: { x: 60, y: -320 },
    slot: { x: 430, y: 560 },
    phase: 2.8,
  },
  {
    id: "research",
    label: "Research",
    sub: "arXiv",
    icon: LuFileText,
    scatter: { x: 640, y: 700, r: 3.5 },
    enterFrom: { x: -340, y: 300 },
    slot: { x: 430, y: 682 },
    phase: 3.9,
  },
  {
    id: "orgs",
    label: "Organizations",
    sub: "The public record",
    icon: LuBuilding2,
    scatter: { x: 1170, y: 695, r: -3 },
    enterFrom: { x: 340, y: 320 },
    slot: { x: 430, y: 804 },
    phase: 5.0,
  },
];

const CARD_W = 340;
const CARD_H = 96;

/**
 * Renders the five cards.
 *   t < ASSEMBLE_AT  — scattered pose (Scene 1), gentle idle drift
 *   t >= ASSEMBLE_AT — continuous interpolation into the aligned index slots
 * The same function is rendered by both scenes, so the crossfade is
 * pixel-identical — no handoff, no flash.
 */
export function SourceFragments({ t }: { t: number }) {
  return (
    <>
      {SOURCE_FRAGMENTS.map((f, i) => {
        let x = f.scatter.x;
        let y = f.scatter.y;
        let rot = f.scatter.r;
        let scale = 1;
        let opacity = 1;

        if (t < ASSEMBLE_AT) {
          const p = easeOutQuint(seg(t, 0.2 + i * 0.18, 0.8 + i * 0.18));
          x = lerp(f.scatter.x + f.enterFrom.x, f.scatter.x, p);
          y = lerp(f.scatter.y + f.enterFrom.y, f.scatter.y, p);
          rot = lerp(f.scatter.r * 2.2, f.scatter.r, p);
          opacity = Math.min(1, p * 2.2);
          /* Deterministic idle drift — a fixed phase per card. */
          x += Math.sin(t * 1.1 + f.phase) * 3;
          y += Math.cos(t * 0.9 + f.phase) * 2.4;
        } else {
          const p = easeOutQuint(
            seg(t, ASSEMBLE_AT + 0.05 + i * 0.09, ASSEMBLE_AT + 0.85 + i * 0.09)
          );
          x = lerp(f.scatter.x, f.slot.x, p);
          y = lerp(f.scatter.y, f.slot.y, p);
          rot = lerp(f.scatter.r, 0, p);
          /* Scale stays 1 — these are the same nodes at every t. */
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

/** Curved flight trajectories from scatter pose to index slot. */
export function FragmentTrajectories({ t }: { t: number }) {
  return (
    <svg
      className="absolute"
      width={STAGE_W}
      height={STAGE_H}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      aria-hidden
    >
      {SOURCE_FRAGMENTS.map((f, i) => {
        const p = seg(
          t,
          ASSEMBLE_AT + 0.1 + i * 0.09,
          ASSEMBLE_AT + 0.8 + i * 0.09
        );
        const out = 1 - seg(t, ASSEMBLE_AT + 1.05, ASSEMBLE_AT + 1.45);
        if (p <= 0 || out <= 0) return null;
        const cx = (f.scatter.x + f.slot.x) / 2;
        const cy = (f.scatter.y + f.slot.y) / 2 - 130;
        return (
          <path
            key={f.id}
            d={`M ${f.scatter.x} ${f.scatter.y} Q ${cx} ${cy}, ${f.slot.x} ${f.slot.y}`}
            fill="none"
            stroke={C.accent}
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.5 * out}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
          />
        );
      })}
    </svg>
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
      width={STAGE_W}
      height={STAGE_H}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
      aria-hidden
    >
      {paths.map((d, i) => {
        const p = seg(t, 1.0 + i * 0.12, 1.55 + i * 0.12);
        const out = 1 - seg(t, 1.9 + i * 0.1, 2.35 + i * 0.1);
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
        const p = seg(t, 0.9 + i * 0.07, 1.2 + i * 0.07);
        const out = 1 - seg(t, 2.1, 2.5);
        if (p <= 0 || out <= 0) return null;
        const s = 0.4 + 0.6 * p;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={4.5}
            fill={C.ink}
            opacity={0.4 * out}
            transform={`translate(${cx * (1 - s)} ${cy * (1 - s)}) scale(${s})`}
          />
        );
      })}
    </svg>
  );
}
