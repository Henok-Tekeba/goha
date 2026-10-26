"use client";

import type { ReactNode } from "react";
import { C, easeInOutCubic, easeOutQuint, seg } from "../lib/film";
import { CoverageMatrix } from "./coverage-matrix";
import { SvgLineageGraph } from "./svg-lineage-graph";

/* Ge'ez numerals — the three capability beats are a real sequence. */
const BEAT_NUMERALS = ["፩", "፪", "፫"];

const BEATS = [
  { start: 7, end: 8, caption: "Compare models" },
  { start: 8, end: 9, caption: "Trace model lineage" },
  { start: 9, end: 10, caption: "See what's missing" },
] as const;

/** Shared caption treatment for the three beats, bottom-center. */
function BeatCaption({ t, beat }: { t: number; beat: (typeof BEATS)[number] }) {
  const index = BEATS.indexOf(beat);
  const p = easeOutQuint(seg(t, beat.start + 0.06, beat.start + 0.34));
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
        className="font-bold text-[40px] uppercase leading-none"
        style={{ color: C.ink, letterSpacing: "0.28em" }}
      >
        {beat.caption}
      </span>
    </div>
  );
}

/* Real records from the index — language, size, and exactly what the
   leaderboard publishes for each. Nothing invented. */
const COMPARE_CARDS = [
  {
    name: "hohe-asr-amharic",
    owner: "snapwre",
    lang: "Amharic",
    glyph: "አ",
    size: "606M",
    evalBadge: "FLEURS · 16.0% WER",
    evalRanked: true,
  },
  {
    name: "whisper-amharic-small-v2",
    owner: "chappM",
    lang: "Amharic",
    glyph: "አ",
    size: "242M",
    evalBadge: "Common Voice · 69.0% WER",
    evalRanked: true,
  },
  {
    name: "geez-asr",
    owner: "Samuael",
    lang: "Ge'ez",
    glyph: "ግ",
    size: "318M",
    evalBadge: "Reported · no test set",
    evalRanked: false,
  },
] as const;

function CompareBeat({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      {COMPARE_CARDS.map((card, i) => {
        const p = easeOutQuint(seg(t, 7.02 + i * 0.09, 7.32 + i * 0.09));
        if (p <= 0) return null;
        return (
          <div
            key={card.name}
            className="absolute rounded-2xl"
            style={{
              left: [480, 960, 1440][i],
              top: 400,
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
                <Row label="Language">
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
                <Row label="Size">
                  <span
                    className="text-[18px]"
                    style={{ color: C.ink, fontVariantNumeric: "tabular-nums" }}
                  >
                    {card.size}
                  </span>
                </Row>
                <Row label="Eval">
                  <span
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[15px] leading-none"
                    style={{
                      border: `1px solid ${card.evalRanked ? "rgba(81,162,255,0.5)" : "rgba(255,255,255,0.18)"}`,
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
        const sweep = easeInOutCubic(seg(t, 7.42, 7.98));
        if (sweep <= 0 || sweep >= 1) return null;
        return (
          <div
            className="absolute"
            style={{
              left: 330 + sweep * 1260,
              top: 258,
              width: 2,
              height: 286,
              background: C.accent,
              opacity: 0.55,
            }}
          />
        );
      })()}

      <BeatCaption t={t} beat={BEATS[0]} />
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className="text-[14px] uppercase tracking-[0.18em]"
        style={{ color: "rgba(255,255,255,0.42)" }}
      >
        {label}
      </span>
      <span className="flex min-w-0 items-center">{children}</span>
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
      <CoverageMatrix t={t} />
      <BeatCaption t={t} beat={BEATS[2]} />
    </div>
  );
}

/**
 * Scene 4 — 00:07–00:10 — Three capabilities, one-second beats.
 * Compare → lineage → gaps, each a self-contained micro-scene with a short
 * crossfade.
 */
export function SceneCapabilities({ t }: { t: number }) {
  const fade = 0.15;
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
