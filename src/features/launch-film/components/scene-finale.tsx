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
 * Scene 6 — 00:12–00:15 — The final brand lockup.
 * goha ጎሃ, the thesis line, and the URL — held long enough to read and to
 * screenshot. One drawn underline, one pulsing node, nothing else.
 */
export function SceneFinale({ t }: { t: number }) {
  const markP = easeOutBack(seg(t, 12.12, 12.45));
  const bar1P = easeOutQuint(seg(t, 12.3, 12.62));
  const bar2P = easeOutQuint(seg(t, 12.38, 12.7));
  const accentPulse = seg(t, 13.7, 14.5);

  return (
    <div className="absolute inset-0">
      {/* Constellation */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        {NODES.map((node, i) => {
          const p = easeOutQuint(seg(t, 12.5 + i * 0.09, 12.95 + i * 0.09));
          if (p <= 0) return null;
          return (
            <line
              key={i}
              x1={node.x}
              y1={node.y}
              x2={960}
              y2={384}
              stroke="rgba(255,255,255,0.13)"
              strokeWidth={1}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
            />
          );
        })}
        {NODES.map((node, i) => {
          const p = seg(t, 12.55 + i * 0.09, 12.8 + i * 0.09);
          if (p <= 0) return null;
          const pulse = node.accent && accentPulse > 0 && accentPulse < 1;
          return (
            <g key={i}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.accent ? 4.5 : 3}
                fill={node.accent ? C.accent : "rgba(255,255,255,0.55)"}
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
            start={12.38}
            end={12.95}
            size={150}
            weight={750}
            tracking="-0.045em"
            mode="relative"
          >
            goha
          </WipeLine>
          <WipeLine
            t={t}
            start={12.56}
            end={13.1}
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
        className="absolute whitespace-nowrap text-center text-[30px] uppercase tracking-[0.34em]"
        style={{
          left: "50%",
          top: 668,
          transform: `translate(-50%, ${(1 - easeOutQuint(seg(t, 12.98, 13.42))) * 14}px)`,
          opacity: seg(t, 12.98, 13.32),
          color: C.ink,
        }}
      >
        Making Ethiopian AI legible.
      </div>

      {/* URL + drawn underline — visible from 13.1s, holds to the end */}
      <div
        className="absolute text-center font-semibold text-[31px]"
        style={{
          left: "50%",
          top: 788,
          transform: "translateX(-50%)",
          opacity: seg(t, 13.1, 13.42),
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
          transform: `translateX(-50%) scaleX(${easeOutQuint(seg(t, 13.28, 13.82))})`,
          transformOrigin: "center",
        }}
      />
    </div>
  );
}
