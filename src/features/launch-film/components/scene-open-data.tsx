"use client";

import { LuCode, LuFlaskConical, LuRefreshCw } from "react-icons/lu";

import { C, easeOutBack, easeOutQuint, seg } from "../lib/film";
import { WipeLine } from "./wipe-line";

/* Real field values for a real indexed record (hohe-asr-amharic). */
const CODE_LINES: Array<Array<{ text: string; color: string }>> = [
  [{ text: "{", color: C.dim }],
  [
    { text: `  "sourceId": `, color: C.accent },
    { text: `"hf:snapwre/hohe-asr-amharic",`, color: C.ink },
  ],
  [
    { text: `  "languages": `, color: C.accent },
    { text: `["Amharic"],`, color: C.ink },
  ],
  [
    { text: `  "paramCount": `, color: C.accent },
    { text: "606104800,", color: C.ink },
  ],
  [
    { text: `  "downloadsMonthly": `, color: C.accent },
    { text: "1225", color: C.ink },
  ],
  [{ text: "}", color: C.dim }],
];

const REUSE_NODES = [
  { icon: LuFlaskConical, label: "Research", y: 330 },
  { icon: LuCode, label: "Development", y: 500 },
  { icon: LuRefreshCw, label: "Reuse", y: 670 },
];

/**
 * Scene 5 — 00:16.6–00:19.8 — Open data.
 * A real record, rendered as inspectable JSON with a blinking cursor, wired
 * by drawn connectors to the three things you can do with it: research it,
 * build on it, reuse it.
 */
export function SceneOpenData({ t }: { t: number }) {
  const cursorOn = t >= 18.15 && ((t - 18.15) * 1.2) % 1 < 0.62;

  return (
    <div className="absolute inset-0">
      {/* Code panel */}
      <div
        className="absolute rounded-2xl"
        style={{
          left: 160,
          top: 250,
          width: 820,
          height: 380,
          background: C.panel,
          border: `1px solid ${C.panelLine}`,
          opacity: seg(t, 16.75, 17.05),
          transform: `translateY(${(1 - easeOutQuint(seg(t, 16.75, 17.05))) * 20}px)`,
          willChange: "transform, opacity",
        }}
      >
        <div
          className="flex items-center justify-between px-8 pt-6 text-[17px]"
          style={{
            color: C.dim,
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          <span>public/data/projects.json</span>
          <span style={{ opacity: 0.6 }}>GET /data/projects.json</span>
        </div>

        <div
          className="mt-4 px-8 text-[23px]"
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            lineHeight: "44px",
          }}
        >
          {CODE_LINES.map((line, i) => {
            const p = easeOutQuint(seg(t, 17.05 + i * 0.16, 17.33 + i * 0.16));
            if (p <= 0) return null;
            const isLast = i === CODE_LINES.length - 1;
            return (
              <div
                key={i}
                style={{
                  opacity: Math.min(1, p * 2),
                  transform: `translateX(${(1 - p) * -10}px)`,
                  whiteSpace: "pre",
                }}
              >
                {line.map((part, j) => (
                  <span key={j} style={{ color: part.color }}>
                    {part.text}
                  </span>
                ))}
                {isLast && cursorOn && (
                  <span
                    className="ml-1 inline-block h-[26px] w-[2px] translate-y-[6px]"
                    style={{ background: C.accent }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connectors + reuse nodes */}
      <svg
        className="absolute"
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        aria-hidden
      >
        {REUSE_NODES.map((node, i) => {
          const p = easeOutQuint(seg(t, 18.05 + i * 0.09, 18.4 + i * 0.09));
          if (p <= 0) return null;
          return (
            <path
              key={node.label}
              d={`M 992 ${node.y} C 1160 ${node.y}, 1290 ${node.y}, 1436 ${node.y}`}
              fill="none"
              stroke={C.accent}
              strokeWidth={1.5}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - p}
              opacity={0.75}
            />
          );
        })}
      </svg>

      {REUSE_NODES.map((node, i) => {
        const p = seg(t, 18.2 + i * 0.11, 18.5 + i * 0.11);
        if (p <= 0) return null;
        const Icon = node.icon;
        const s = 0.7 + 0.3 * easeOutBack(p, 1.15);
        return (
          <div
            key={node.label}
            className="absolute flex items-center gap-4"
            style={{
              left: 1452,
              top: node.y,
              transform: `translateY(-50%) scale(${s})`,
              opacity: Math.min(1, p * 2.5),
              transformOrigin: "left center",
            }}
          >
            <div
              className="flex size-16 items-center justify-center rounded-2xl"
              style={{
                border: `1px solid ${C.panelLine}`,
                background: C.panel,
              }}
            >
              <Icon size={26} color={C.ink} />
            </div>
            <span className="text-[20px]" style={{ color: C.dim }}>
              {node.label}
            </span>
          </div>
        );
      })}

      <WipeLine t={t} start={18.8} end={19.4} size={76} x="50%" y={872}>
        Open data. Traceable sources.
      </WipeLine>

      <div
        className="absolute flex justify-center gap-3"
        style={{ left: "50%", top: 940, transform: "translateX(-50%)" }}
      >
        {["Search", "Compare", "Reuse"].map((word, i) => {
          const p = seg(t, 19.05 + i * 0.09, 19.27 + i * 0.09);
          if (p <= 0) return null;
          return (
            <span
              key={word}
              className="rounded-full px-4 py-1.5 text-[16px]"
              style={{
                border: `1px solid ${C.panelLine}`,
                color: C.dim,
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - p) * 10}px)`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
