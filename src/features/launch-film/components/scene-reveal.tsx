"use client";

import { C, easeOutBack, easeOutCubic, easeOutQuint, seg } from "../lib/film";
import { FragmentTrajectories, SourceFragments } from "./source-fragments";
import { WipeLine } from "./wipe-line";

/**
 * Scene 2 — 00:03.6–00:07.2 — The reveal.
 * The scattered fragments assemble into a clean left-hand index (their flight
 * paths draw as they move); connector strokes and the rail settle; the
 * goha ጎሃ wordmark lands as the first major payoff. Disorder becoming
 * structure — no explosion, no magic.
 */
export function SceneReveal({ t }: { t: number }) {
  const railP = easeOutCubic(seg(t, 4.35, 4.95));
  const railDots = seg(t, 4.5, 5.05);

  /* One restrained ring pulse at the moment of assembly. */
  const ringP = seg(t, 3.62, 4.35);

  return (
    <div className="absolute inset-0">
      <SourceFragments t={t} />
      <FragmentTrajectories t={t} />

      {/* Index rail + slot dots */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        <path
          d="M 250 286 V 852"
          stroke={C.line}
          strokeWidth={1.5}
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - railP}
        />
        {[316, 438, 560, 682, 804].map((y, i) => (
          <circle
            key={y}
            cx={250}
            cy={y}
            r={3.5}
            fill={C.accent}
            opacity={railDots > i * 0.18 ? 0.9 : 0}
          />
        ))}

        {/* Assembly ring — anchored where the fragments land */}
        {ringP > 0 && ringP < 1 && (
          <circle
            cx={430}
            cy={560}
            r={40 + 200 * easeOutCubic(ringP)}
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
        {/* Logo mark: circle + two bars, in the brand's own light-theme colors */}
        <svg
          width={120}
          height={104}
          viewBox="0 0 96 84"
          className="mx-auto"
          aria-hidden
        >
          {(() => {
            const circleP = easeOutBack(seg(t, 4.5, 4.85), 1.15);
            const bar1P = easeOutQuint(seg(t, 4.68, 5.02));
            const bar2P = easeOutQuint(seg(t, 4.76, 5.1));
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
            start={4.9}
            end={5.55}
            size={148}
            weight={750}
            tracking="-0.045em"
            mode="relative"
          >
            goha
          </WipeLine>
          <WipeLine
            t={t}
            start={5.08}
            end={5.72}
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
            width: 440 * easeOutCubic(seg(t, 5.55, 5.95)),
            background: C.line,
          }}
        />
        <div
          className="mt-6 text-center font-medium text-[26px] tracking-[0.1em]"
          style={{
            color: C.dim,
            opacity: seg(t, 5.7, 6.15),
            transform: `translateY(${(1 - easeOutQuint(seg(t, 5.7, 6.15))) * 12}px)`,
          }}
        >
          The Ethiopian AI Index
        </div>
      </div>

      {/* Factual anchor line */}
      <div
        className="absolute whitespace-nowrap text-center text-[18px]"
        style={{
          left: "50%",
          top: 946,
          transform: "translateX(-50%)",
          color: C.dim,
          opacity: seg(t, 5.95, 6.55),
        }}
      >
        One search across models, datasets and research — rebuilt every day.
      </div>
    </div>
  );
}
