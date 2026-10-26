"use client";

import LanguageRadarChart from "@/features/ecosystem/components/charts/language-radar-chart";

import { C, seg } from "../lib/film";
import { filmCoverage } from "../lib/film-data";
import { FilmChart } from "./film-chart";

/* The radar mounts on cue so evilcharts' own entrance plays fully visible. */
const RADAR_AT = 15.2;
const RADAR_LEFT = 110;
const RADAR_TOP = 176;
const RADAR_W = 1400;
const RADAR_H = 744;
const RADAR_SCALE = 1.5;

/**
 * The gaps beat's real chart — the exact evilcharts radar and
 * language-coverage data the /lang "The gaps, side by side" section renders,
 * with the gap report's headline numbers beside it.
 */
export function GapsRadar({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      {t >= RADAR_AT && (
        <FilmChart
          left={RADAR_LEFT}
          top={RADAR_TOP}
          width={RADAR_W}
          height={RADAR_H}
          scale={RADAR_SCALE}
        >
          <LanguageRadarChart
            coverage={filmCoverage}
            className="h-[496px] w-full"
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
          className="mt-4 font-medium text-[20px] tracking-[0.05em]"
          style={{ color: C.dim }}
        >
          empty cells
        </div>
        <div className="mt-2 text-[16px]" style={{ color: "rgba(0,0,0,0.45)" }}>
          language × task
        </div>

        {/* Second real gap: unevaluated models */}
        <div
          className="mt-9 h-px"
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
          className="mt-3 text-[16px]"
          style={{ color: C.dim, opacity: seg(t, 16.05, 16.3) }}
        >
          models publish no evaluation
        </div>
      </div>
    </div>
  );
}
