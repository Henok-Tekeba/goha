"use client";

import { C, easeOutBack, easeOutQuint, seg } from "../lib/film";
import { WipeLine } from "./wipe-line";

/* Quiet constellation above the mark — one accent node pulses once.
   Nodes stay above the wordmark so no line crosses the type. */
const NODES = [
  { x: 748, y: 236, accent: true },
  { x: 1184, y: 228 },
  { x: 792, y: 168 },
  { x: 1128, y: 172 },
  { x: 960, y: 146 },
];

/**
 * Scene 6 — 00:19.8–00:24 — The final brand lockup.
 * goha ጎሃ over a giant faint Ethiopic watermark, the thesis line, and the
 * URL — held long enough to read and to screenshot. One drawn underline,
 * one pulsing node, nothing else.
 */
export function SceneFinale({ t }: { t: number }) {
  const markP = easeOutBack(seg(t, 19.95, 20.35), 1.15);
  const bar1P = easeOutQuint(seg(t, 20.15, 20.5));
  const bar2P = easeOutQuint(seg(t, 20.23, 20.58));
  const accentPulse = seg(t, 22.2, 23.0);
  const watermarkP = seg(t, 20.5, 21.3);

  return (
    <div className="absolute inset-0">
      {/* Giant faint Ethiopic watermark behind the lockup */}
      <div
        className="absolute text-center"
        style={{
          left: "50%",
          top: 430,
          fontSize: 620,
          lineHeight: 1,
          fontFamily:
            "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif",
          color: C.ink,
          opacity: 0.035 * watermarkP,
          transform: `translate(-50%, -50%) scale(${1 + 0.03 * seg(t, 20.5, 24)})`,
          willChange: "transform, opacity",
        }}
      >
        ጎሃ
      </div>

      {/* Constellation */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        {NODES.map((node, i) => {
          const p = easeOutQuint(seg(t, 20.3 + i * 0.09, 20.75 + i * 0.09));
          if (p <= 0) return null;
          return (
            <line
              key={i}
              x1={node.x}
              y1={node.y}
              x2={960}
              y2={384}
              stroke="rgba(0,0,0,0.14)"
              strokeWidth={1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
        {NODES.map((node, i) => {
          const p = seg(t, 20.42 + i * 0.09, 20.67 + i * 0.09);
          if (p <= 0) return null;
          const pulse = node.accent && accentPulse > 0 && accentPulse < 1;
          return (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.accent ? 4.5 : 3}
                fill={node.accent ? C.accent : "rgba(23,23,23,0.5)"}
                opacity={
                  Math.min(1, p * 2) *
                  (node.accent && accentPulse >= 1 ? 0.35 : 1)
                }
              />
              {pulse && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4.5 + accentPulse * 14}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={1.5}
                  opacity={(1 - accentPulse) * 0.7}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Logo mark */}
      <svg
        width={168}
        height={148}
        viewBox="0 0 96 84"
        className="absolute"
        style={{
          left: 960,
          top: 330,
          transform: `translate(-50%, -50%) scale(${Math.max(0.001, markP)})`,
          opacity: Math.min(1, markP * 2.5),
          transformOrigin: "center",
        }}
        aria-hidden
      >
        <circle cx={48} cy={34} r={26} fill={C.ink} />
        <rect
          x={12}
          y={68}
          width={72 * bar1P}
          height={5}
          rx={2.5}
          fill={C.ink}
        />
        <rect
          x={22}
          y={60}
          width={52 * bar2P}
          height={5}
          rx={2.5}
          fill={C.accent}
        />
      </svg>

      <div className="absolute inset-x-0 top-[470px]">
        <div className="flex items-baseline justify-center gap-9">
          <WipeLine
            t={t}
            start={20.35}
            end={21.0}
            size={150}
            weight={750}
            tracking="-0.045em"
            mode="relative"
          >
            goha
          </WipeLine>
          <WipeLine
            t={t}
            start={20.55}
            end={21.2}
            size={128}
            weight={700}
            mode="relative"
            ethiopic
          >
            ጎሃ
          </WipeLine>
        </div>
      </div>

      {/* Thesis line */}
      <div
        className="absolute whitespace-nowrap text-center font-medium text-[33px] tracking-[0.02em]"
        style={{
          left: "50%",
          top: 668,
          transform: `translate(-50%, ${(1 - easeOutQuint(seg(t, 21.1, 21.55))) * 14}px)`,
          opacity: seg(t, 21.1, 21.44),
          color: C.ink,
        }}
      >
        Making Ethiopian AI legible.
      </div>

      {/* URL + drawn underline — visible from ~21.6s, holds to the end */}
      <div
        className="absolute text-center font-semibold text-[31px]"
        style={{
          left: "50%",
          top: 788,
          transform: "translateX(-50%)",
          opacity: seg(t, 21.35, 21.68),
          color: C.ink,
          letterSpacing: "0.02em",
        }}
      >
        goha.enoch.et
      </div>
      <div
        className="absolute h-[2px] rounded-full"
        style={{
          left: "50%",
          top: 838,
          width: 236,
          background: C.accent,
          transform: `translateX(-50%) scaleX(${easeOutQuint(seg(t, 21.55, 22.1))})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
