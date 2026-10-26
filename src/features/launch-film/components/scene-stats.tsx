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

/* 478 records = 188 models + 211 datasets + 75 papers + 4 companies. */
const SPLIT = [
  { value: 188, label: "188 models", color: C.accent },
  { value: 211, label: "211 datasets", color: "#3F3F46" },
  { value: 75, label: "75 papers", color: "#A1A1AA" },
  { value: 4, label: "4 companies", color: "#E4E4E7" },
] as const;

const SPLIT_W = 1240;

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
 * Scene 3 — 00:07.2–00:12 — The ecosystem, quantified.
 * Four unhurried count-ups, the 478 total with a real composition bar, then
 * the eight language chips. A quiet hairline grid and two traveling markers
 * give the flat composition depth without decoration.
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
              1 - Math.max(0, Math.min(1, (t - 7.35 - i * 0.04) / 0.55))
            }
          />
        ))}
        {/* Two traveling markers, ping-ponging along the outer rails */}
        {[240, 1680].map((x, i) => {
          if (t < 7.5 || t > 11.5) return null;
          const span = 11.5 - 7.5;
          const phase = i === 0 ? 0 : 0.5;
          const raw = Math.abs(
            (((((t - 7.5) / span + phase) % 1) + 1) % 1) * 2 - 1
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
        const start = 7.55 + i * 0.5;
        const p = seg(t, start, start + 0.05);
        const under = Math.min(1, seg(t, start + 0.72, start + 1.02));
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
              duration={1.05}
              className="font-extrabold text-[148px] leading-none"
              style={{ color: C.ink, letterSpacing: "-0.03em" }}
            />
            <div
              className="mt-5 font-medium text-[23px] tracking-[0.04em]"
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
          top: 620,
          width: 1240,
          background: C.line,
          transform: `translateX(-50%) scaleX(${Math.min(1, seg(t, 10.35, 10.65))})`,
        }}
      />

      {/* Total + real composition bar */}
      <div
        className="absolute flex items-baseline justify-center gap-6"
        style={{
          left: "50%",
          top: 662,
          transform: "translateX(-50%)",
          opacity: seg(t, 10.42, 10.62),
        }}
      >
        <AnimatedNumber
          t={t}
          target={478}
          start={10.5}
          duration={0.55}
          className="font-extrabold text-[84px] leading-none"
          style={{ color: C.ink, letterSpacing: "-0.03em" }}
        />
        <span
          className="font-medium text-[25px] tracking-[0.06em]"
          style={{ color: C.dim }}
        >
          Project records
        </span>
      </div>

      {/* Composition bar: models / datasets / papers / companies */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 782,
          width: SPLIT_W,
          transform: "translateX(-50%)",
          opacity: seg(t, 10.95, 11.1),
        }}
      >
        <div className="flex h-1.5 w-full overflow-hidden rounded-full">
          {SPLIT.map((part, i) => {
            const p = Math.min(1, seg(t, 11.0 + i * 0.07, 11.3 + i * 0.07));
            const width = (part.value / 478) * SPLIT_W;
            return (
              <div
                key={part.label}
                style={{
                  width,
                  background: part.color,
                  transformOrigin: "left center",
                  transform: `scaleX(${p})`,
                }}
              />
            );
          })}
        </div>
        {/* Segment labels; the companies sliver is labeled after the bar */}
        <div className="relative h-8">
          {SPLIT.map((part, i) => {
            const p = seg(t, 11.32 + i * 0.06, 11.52 + i * 0.06);
            if (p <= 0) return null;
            const width = (part.value / 478) * SPLIT_W;
            const center =
              SPLIT.slice(0, i).reduce(
                (acc, prev) => acc + (prev.value / 478) * SPLIT_W,
                0
              ) +
              width / 2;
            const offBar = width < 90;
            return (
              <span
                key={part.label}
                className="absolute whitespace-nowrap text-[15px]"
                style={{
                  left: offBar ? SPLIT_W + 14 : center,
                  top: 10,
                  transform: `translate(${offBar ? 0 : "-50%"}, ${(1 - p) * 8}px)`,
                  color: C.dim,
                  opacity: Math.min(1, p * 2),
                }}
              >
                {part.label}
              </span>
            );
          })}
        </div>
      </div>

      <div
        className="absolute font-medium text-[20px] tracking-[0.06em]"
        style={{
          left: "50%",
          top: 862,
          transform: "translateX(-50%)",
          color: C.dim,
          opacity: seg(t, 11.3, 11.55),
        }}
      >
        8 Languages
      </div>

      <div
        className="absolute flex flex-nowrap justify-center"
        style={{ left: "50%", top: 906, transform: "translateX(-50%)" }}
      >
        {LANGUAGES.map((lang, i) => {
          const p = seg(t, 11.3 + i * 0.055, 11.58 + i * 0.055);
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
