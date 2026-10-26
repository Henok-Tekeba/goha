"use client";

import LanguageRadarChart from "@/features/ecosystem/components/charts/language-radar-chart";

import { C, easeOutCubic, seg } from "../lib/film";
import { filmCoverage } from "../lib/film-data";
import { FilmChart } from "./film-chart";

/* The radar mounts on cue, then each language's polygon lands one by one —
   Amharic first (it holds the per-task maximum, so the rings stay put),
   the rest following at a beat. Driven by the film clock, so the formation
   plays even under OS reduced motion and scrubs exactly. */
const RADAR_AT = 15.2;
const RADAR_FORM_START = 15.3;
const RADAR_STAGGER = 0.11;
const RADAR_LEFT = 110;
const RADAR_TOP = 176;
const RADAR_W = 1400;
const RADAR_H = 744;
const RADAR_SCALE = 1.5;

export function GapsRadar({ t }: { t: number }) {
  const languageIndex = new Map(
    filmCoverage.languages.map((lang, i) => [lang, i])
  );
  const rows = filmCoverage.rows.map((row) => {
    const next: Record<string, number | string> = { task: row.task };
    for (const lang of filmCoverage.languages) {
      const i = languageIndex.get(lang) ?? 0;
      next[lang] = t >= RADAR_FORM_START + i * RADAR_STAGGER ? row[lang] : 0;
    }
    return next;
  });

  const enter = easeOutCubic(seg(t, RADAR_AT, RADAR_AT + 0.4));

  return (
    <div className="absolute inset-0">
      {t >= RADAR_AT && (
        <FilmChart
          left={RADAR_LEFT}
          top={RADAR_TOP}
          width={RADAR_W}
          height={RADAR_H}
          scale={RADAR_SCALE}
          opacity={enter}
          style={{
            transform: `scale(${0.94 + 0.06 * enter})`,
            transformOrigin: "center center",
          }}
        >
          <LanguageRadarChart
            coverage={{ ...filmCoverage, rows }}
            className="h-[496px] w-full"
            renderer="svg"
            animation={false}
          />
        </FilmChart>
      )}

      {/* The headline number of the gap report */}
      <div
        className="absolute flex flex-col"
        style={{ left: 1592, top: 320, opacity: seg(t, 15.6, 15.85) }}
      >
        <div className="flex items-baseline gap-3">
          <span
            className="font-extrabold text-[136px] leading-none"
            style={{ color: C.ink, letterSpacing: "-0.03em" }}
          >
            17
          </span>
          <span
            className="font-bold text-[40px] leading-none"
            style={{ color: C.dim }}
          >
            /48
          </span>
        </div>
        <div
          className="mt-4 font-medium text-[20px] tracking-[0.02em]"
          style={{ color: C.dim }}
        >
          language-and-task pairs
        </div>
        <div
          className="mt-1.5 text-[16px]"
          style={{ color: "rgba(0,0,0,0.45)" }}
        >
          with no model or dataset at all
        </div>

        {/* Second real gap: unevaluated models */}
        <div
          className="mt-8 h-px"
          style={{
            width: 250,
            background: C.line,
            opacity: seg(t, 15.9, 16.1),
          }}
        />
        <div
          className="mt-6 flex items-baseline gap-3"
          style={{ opacity: seg(t, 15.95, 16.2) }}
        >
          <span
            className="font-extrabold text-[60px] leading-none"
            style={{ color: C.ink, letterSpacing: "-0.03em" }}
          >
            162
          </span>
          <span
            className="font-bold text-[23px] leading-none"
            style={{ color: C.dim }}
          >
            /180
          </span>
        </div>
        <div
          className="mt-3 text-[16px] leading-snug"
          style={{ color: C.dim, opacity: seg(t, 16.05, 16.3) }}
        >
          models publish no accuracy test —
          <br />
          their claims can't be checked
        </div>

        {/* Two real gaps, in human terms (language-coverage.json:
            ASR × Somali = 0, TTS × Ge'ez = 0) */}
        <div
          className="mt-9 flex flex-col gap-2.5"
          style={{ opacity: seg(t, 16.1, 16.4) }}
        >
          {[
            "No speech recognition for Somali",
            "No text-to-speech for Ge'ez",
          ].map((line) => (
            <div key={line} className="flex items-center gap-2.5">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: C.accent }}
              />
              <span
                className="text-[17px] leading-snug"
                style={{ color: C.ink }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
