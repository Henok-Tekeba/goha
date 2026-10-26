"use client";

import { C, easeOutBack, seg } from "../lib/film";

/**
 * Language × task coverage, straight from the index's language-coverage data
 * (models + datasets per cell; Somali–Translation is covered by research).
 * 17 of 48 cells are empty — exactly what the /gaps report publishes.
 * Tasks are rows (full names); languages are glyph-headed columns.
 */
const LANG_COLS = [
  { glyph: "አ", name: "Amharic" },
  { glyph: "O", name: "Afaan Oromo" },
  { glyph: "ት", name: "Tigrinya" },
  { glyph: "ግ", name: "Ge'ez" },
  { glyph: "S", name: "Somali" },
  { glyph: "W", name: "Wolaytta" },
  { glyph: "S", name: "Sidaamu Afoo" },
  { glyph: "E", name: "English" },
] as const;

/* filled[r][c] — r: task row, c: language column */
const TASK_ROWS = [
  { task: "ASR", filled: [1, 1, 1, 1, 0, 1, 1, 1] },
  { task: "TTS", filled: [1, 1, 1, 0, 0, 0, 1, 0] },
  { task: "Translation", filled: [1, 1, 1, 1, 1, 0, 0, 1] },
  { task: "LLM", filled: [1, 1, 1, 1, 1, 0, 0, 1] },
  { task: "NER", filled: [1, 1, 1, 1, 0, 0, 0, 1] },
  { task: "Embeddings", filled: [1, 0, 0, 1, 0, 0, 0, 1] },
] as const;

/* A few highlighted gaps that pulse — the point of the scene. */
const PULSE_CELLS = new Set([
  "0-4", // Somali × ASR
  "1-3", // Ge'ez × TTS
  "3-6", // Sidaamu Afoo × LLM
]);

const CELL = 44;
const GAP = 12;
const STEP = CELL + GAP;

export function CoverageMatrix({ t }: { t: number }) {
  const originX = 480;
  const headerY = 268;
  const originY = 306;

  return (
    <div className="absolute inset-0">
      {/* Language glyph column headers */}
      {LANG_COLS.map((lang, c) => (
        <div
          key={lang.name}
          className="absolute text-center text-[21px] leading-none"
          style={{
            left: originX + c * STEP,
            top: headerY,
            width: CELL,
            color: C.ink,
            opacity: seg(t, 15.25, 15.45),
            fontFamily:
              "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif",
          }}
        >
          {lang.glyph}
        </div>
      ))}

      {TASK_ROWS.map((row, r) => (
        <div key={row.task}>
          {/* Task row label, right-aligned to the grid */}
          <div
            className="absolute flex items-center justify-end"
            style={{
              left: 240,
              top: originY + r * STEP,
              width: originX - 260,
              height: CELL,
              opacity: seg(t, 15.25 + r * 0.03, 15.45 + r * 0.03),
            }}
          >
            <span className="text-[17px]" style={{ color: C.ink }}>
              {row.task}
            </span>
          </div>

          {row.filled.map((filled, c) => {
            const idx = r * LANG_COLS.length + c;
            const p = seg(t, 15.3 + idx * 0.014, 15.54 + idx * 0.014);
            const key = `${r}-${c}`;
            const pulse = PULSE_CELLS.has(key);
            const pulseP = seg(t, 16.05, 16.45);

            if (filled) {
              if (p <= 0) return null;
              return (
                <div
                  key={key}
                  className="absolute rounded-[10px]"
                  style={{
                    left: originX + c * STEP,
                    top: originY + r * STEP,
                    width: CELL,
                    height: CELL,
                    background: "rgba(23,23,23,0.87)",
                    opacity: Math.min(1, p * 2),
                    transform: `scale(${0.3 + 0.7 * easeOutBack(p)})`,
                  }}
                />
              );
            }

            return (
              <div key={key}>
                <div
                  className="absolute rounded-[10px]"
                  style={{
                    left: originX + c * STEP,
                    top: originY + r * STEP,
                    width: CELL,
                    height: CELL,
                    border: `1px solid ${pulse ? "rgba(43,127,255,0.4)" : "rgba(0,0,0,0.16)"}`,
                    opacity: 0.5 + (pulse ? 0.5 * seg(t, 15.5, 15.75) : 0),
                  }}
                />
                {pulse && pulseP > 0 && pulseP < 1 && (
                  <div
                    className="absolute rounded-[10px]"
                    style={{
                      left: originX + c * STEP,
                      top: originY + r * STEP,
                      width: CELL,
                      height: CELL,
                      border: `1.5px solid ${C.accent}`,
                      opacity: (1 - pulseP) * 0.8,
                      transform: `scale(${1 + pulseP * 0.28})`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* The headline number of the gap report */}
      <div
        className="absolute flex flex-col"
        style={{ left: 1260, top: 330, opacity: seg(t, 15.6, 15.85) }}
      >
        <div className="flex items-baseline gap-3">
          <span
            className="font-extrabold text-[150px] leading-none"
            style={{ color: C.ink, letterSpacing: "-0.03em" }}
          >
            17
          </span>
          <span
            className="font-bold text-[44px] leading-none"
            style={{ color: C.dim }}
          >
            /48
          </span>
        </div>
        <div
          className="mt-4 font-medium text-[21px] tracking-[0.05em]"
          style={{ color: C.dim }}
        >
          empty cells
        </div>
        <div className="mt-2 text-[17px]" style={{ color: "rgba(0,0,0,0.45)" }}>
          language × task
        </div>

        {/* Second real gap: unevaluated models */}
        <div
          className="mt-10 h-px"
          style={{
            width: 260,
            background: C.line,
            opacity: seg(t, 15.9, 16.1),
          }}
        />
        <div
          className="mt-6 flex items-baseline gap-3"
          style={{ opacity: seg(t, 15.95, 16.2) }}
        >
          <span
            className="font-extrabold text-[64px] leading-none"
            style={{ color: C.ink, letterSpacing: "-0.03em" }}
          >
            170
          </span>
          <span
            className="font-bold text-[24px] leading-none"
            style={{ color: C.dim }}
          >
            /188
          </span>
        </div>
        <div
          className="mt-3 text-[17px]"
          style={{ color: C.dim, opacity: seg(t, 16.05, 16.3) }}
        >
          models publish no evaluation
        </div>
      </div>
    </div>
  );
}
