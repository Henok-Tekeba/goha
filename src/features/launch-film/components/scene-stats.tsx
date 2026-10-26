"use client";

import { C, seg } from "../lib/film";
import { AnimatedNumber } from "./animated-number";

/* Real snapshot figures — the supplied source of truth. */
const STATS = [
  { value: 188, label: "Models", x: 340 },
  { value: 211, label: "Datasets", x: 760 },
  { value: 75, label: "Research papers", x: 1180 },
  { value: 193, label: "Organizations", x: 1600 },
] as const;

/* The canonical language set, in the index's own order. */
const LANGUAGES = [
  { glyph: "አ", name: "Amharic" },
  { glyph: "O", name: "Afaan Oromo" },
  { glyph: "ት", name: "Tigrinya" },
  { glyph: "ግ", name: "Ge'ez" },
  { glyph: "S", name: "Somali" },
  { glyph: "W", name: "Wolaytta" },
  { glyph: "S", name: "Sidaamu Afoo" },
  { glyph: "E", name: "English" },
] as const;

/**
 * Scene 3 — 00:04–00:07 — The ecosystem, quantified.
 * Four staggered count-ups, the 478 total, then the eight language chips.
 * A quiet hairline grid and two traveling markers give the flat composition
 * depth without decoration.
 */
export function SceneStats({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      {/* Hairline grid, drawing in */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        {[240, 480, 720, 960, 1200, 1440, 1680].map((x, i) => (
          <line
            key={x}
            x1={x}
            y1={150}
            x2={x}
            y2={930}
            stroke={C.lineFaint}
            strokeWidth={1}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={
              1 - Math.max(0, Math.min(1, (t - 4.05 - i * 0.045) / 0.42))
            }
          />
        ))}
        {/* Two traveling markers, ping-ponging along the outer rails */}
        {[240, 1680].map((x, i) => {
          if (t < 4.3 || t > 6.9) return null;
          const span = 6.9 - 4.3;
          const phase = i === 0 ? 0 : 0.5;
          const raw = Math.abs(
            (((((t - 4.3) / span + phase) % 1) + 1) % 1) * 2 - 1
          );
          return (
            <circle
              key={x}
              cx={x}
              cy={150 + raw * 780}
              r={3}
              fill={C.accent}
              opacity={0.4}
            />
          );
        })}
      </svg>

      {/* Four big statistics, staggered */}
      {STATS.map((s, i) => {
        const start = 4.25 + i * 0.28;
        const p = seg(t, start, start + 0.05);
        const under = Math.min(1, seg(t, start + 0.62, start + 0.92));
        return (
          <div
            key={s.label}
            className="absolute flex flex-col items-center"
            style={{
              left: s.x,
              top: 330,
              transform: "translateX(-50%)",
              opacity: Math.min(1, p * 4),
            }}
          >
            <AnimatedNumber
              t={t}
              target={s.value}
              start={start}
              duration={0.92}
              className="font-extrabold text-[148px] leading-none"
              style={{ color: C.ink, letterSpacing: "-0.03em" }}
            />
            <div
              className="mt-5 text-[22px] uppercase tracking-[0.28em]"
              style={{ color: C.dim }}
            >
              {s.label}
            </div>
            <div
              className="mt-4 h-[2px] rounded-full"
              style={{
                width: 72 * under,
                background: C.accent,
                opacity: under,
              }}
            />
          </div>
        );
      })}

      {/* Divider, growing from center */}
      <div
        className="absolute h-px"
        style={{
          left: "50%",
          top: 640,
          width: 1240,
          background: C.line,
          transform: `translateX(-50%) scaleX(${Math.min(1, seg(t, 5.45, 5.78))})`,
        }}
      />

      {/* Total + language chips */}
      <div
        className="absolute flex items-baseline justify-center gap-6"
        style={{
          left: "50%",
          top: 692,
          transform: "translateX(-50%)",
          opacity: seg(t, 5.62, 5.85),
        }}
      >
        <AnimatedNumber
          t={t}
          target={478}
          start={5.7}
          duration={0.6}
          className="font-extrabold text-[84px] leading-none"
          style={{ color: C.ink, letterSpacing: "-0.03em" }}
        />
        <span
          className="text-[24px] uppercase tracking-[0.3em]"
          style={{ color: C.dim }}
        >
          Project records
        </span>
      </div>

      <div
        className="absolute text-[19px] uppercase tracking-[0.32em]"
        style={{
          left: "50%",
          top: 818,
          transform: "translateX(-50%)",
          color: C.dim,
          opacity: seg(t, 5.95, 6.2),
        }}
      >
        8 Languages
      </div>

      <div
        className="absolute flex flex-nowrap justify-center"
        style={{ left: "50%", top: 866, transform: "translateX(-50%)" }}
      >
        {LANGUAGES.map((lang, i) => {
          const p = seg(t, 6.05 + i * 0.075, 6.33 + i * 0.075);
          if (p <= 0) return null;
          return (
            <div
              key={lang.name}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full px-5 py-2.5"
              style={{
                border: `1px solid ${C.panelLine}`,
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - p) * 14}px)`,
                marginLeft: i === 0 ? 0 : 12,
              }}
            >
              <span
                className="text-[22px] leading-none"
                style={{
                  color: C.ink,
                  fontFamily:
                    "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif",
                }}
              >
                {lang.glyph}
              </span>
              <span
                className="text-[19px] leading-none"
                style={{ color: C.ink }}
              >
                {lang.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
