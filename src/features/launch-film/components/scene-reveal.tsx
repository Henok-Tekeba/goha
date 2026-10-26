"use client";

import { C, easeOutBack, easeOutCubic, easeOutQuint, seg } from "../lib/film";
import { SourceFragments } from "./source-fragments";
import { WipeLine } from "./wipe-line";

/**
 * Scene 2 — 00:02–00:04 — The reveal.
 * The scattered fragments assemble into a clean left-hand index; connector
 * strokes draw in; the goha ጎሃ wordmark lands as the first major payoff.
 * Disorder becoming structure — no explosion, no magic.
 */
export function SceneReveal({ t }: { t: number }) {
  const railP = easeOutCubic(seg(t, 2.42, 2.85));
  const railDots = seg(t, 2.5, 3.0);

  /* One restrained ring pulse at the moment of assembly. */
  const ringP = seg(t, 2.0, 2.55);

  return (
    <div className="absolute inset-0">
      <SourceFragments t={t} />

      {/* Index rail + slot dots */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        <path
          d="M 250 300 V 726"
          stroke={C.line}
          strokeWidth={1.5}
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - railP}
        />
        {[330, 452, 574, 696].map((y, i) => (
          <circle
            key={y}
            cx={250}
            cy={y}
            r={3.5}
            fill={C.accent}
            opacity={railDots > i * 0.22 ? 0.9 : 0}
          />
        ))}

        {/* Assembly ring — anchored where the fragments land */}
        {ringP > 0 && ringP < 1 && (
          <circle
            cx={430}
            cy={513}
            r={40 + 210 * easeOutCubic(ringP)}
            fill="none"
            stroke={C.accent}
            strokeWidth={2}
            opacity={(1 - ringP) * 0.45}
          />
        )}
      </svg>

      {/* Brand lockup, right of the assembled index */}
      <div
        className="absolute"
        style={{
          left: 1180,
          top: 470,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Logo mark: circle + two bars, inverted for the dark stage */}
        <svg
          width={120}
          height={104}
          viewBox="0 0 96 84"
          className="mx-auto"
          aria-hidden
        >
          {(() => {
            const circleP = easeOutBack(seg(t, 2.3, 2.62));
            const bar1P = easeOutQuint(seg(t, 2.5, 2.8));
            const bar2P = easeOutQuint(seg(t, 2.58, 2.88));
            return (
              <>
                <circle
                  cx={48}
                  cy={34}
                  r={26}
                  fill={C.ink}
                  opacity={circleP > 0 ? Math.min(1, circleP * 2) : 0}
                  transform={`translate(48 34) scale(${Math.max(0.001, circleP)}) translate(-48 -34)`}
                />
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
              </>
            );
          })()}
        </svg>

        <div className="relative mt-2 flex items-baseline justify-center gap-8">
          <WipeLine
            t={t}
            start={2.55}
            end={3.05}
            size={148}
            weight={750}
            tracking="-0.045em"
            mode="relative"
          >
            goha
          </WipeLine>
          <WipeLine
            t={t}
            start={2.72}
            end={3.22}
            size={126}
            weight={700}
            mode="relative"
            ethiopic
          >
            ጎሃ
          </WipeLine>
        </div>

        {/* Rule + subtitle */}
        <div
          className="mx-auto mt-8 h-px"
          style={{
            width: 440 * easeOutCubic(seg(t, 3.12, 3.5)),
            background: C.line,
          }}
        />
        <div
          className="mt-6 text-center text-[24px] uppercase tracking-[0.4em]"
          style={{
            color: C.dim,
            opacity: seg(t, 3.25, 3.7),
            transform: `translateY(${(1 - easeOutQuint(seg(t, 3.25, 3.7))) * 12}px)`,
          }}
        >
          The Ethiopian AI Index
        </div>
      </div>
    </div>
  );
}
