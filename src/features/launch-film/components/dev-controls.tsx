"use client";

import {
  LuMaximize2,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuVolume2,
  LuVolumeX,
} from "react-icons/lu";

import { FILM_DURATION } from "../lib/film";

/**
 * Development-only controls. Rendered outside the stage, hidden entirely in
 * presentation mode so they never appear in the recorded composition.
 */
export function DevControls({
  t,
  playing,
  sceneLabel,
  soundOn,
  present,
  onRestart,
  onTogglePlay,
  onSeek,
  onToggleSound,
  onTogglePresent,
}: {
  t: number;
  playing: boolean;
  sceneLabel: string;
  soundOn: boolean;
  present: boolean;
  onRestart: () => void;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  onToggleSound: () => void;
  onTogglePresent: () => void;
}) {
  const iconButton =
    "flex size-9 items-center justify-center rounded-full border border-white/10 text-[#FAFAFA] transition-colors hover:bg-white/10";

  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div
        className="flex items-center gap-2.5 rounded-full px-3 py-2"
        style={{
          background: "rgba(12, 12, 14, 0.72)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          type="button"
          onClick={onRestart}
          className={iconButton}
          aria-label="Restart film"
          title="Restart (R)"
        >
          <LuRotateCcw size={16} />
        </button>
        <button
          type="button"
          onClick={onTogglePlay}
          className={iconButton}
          aria-label={playing ? "Pause film" : "Play film"}
          title="Play / pause (Space)"
        >
          {playing ? <LuPause size={16} /> : <LuPlay size={16} />}
        </button>

        <input
          type="range"
          min={0}
          max={FILM_DURATION}
          step={0.01}
          value={t}
          onChange={(e) => onSeek(Number.parseFloat(e.target.value))}
          className="w-64"
          style={{ accentColor: "#51A2FF" }}
          aria-label="Timeline scrubber"
        />

        <span
          className="text-[12.5px] tabular-nums"
          style={{
            color: "#FAFAFA",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
        >
          {t.toFixed(2).padStart(5, "0")} / {FILM_DURATION.toFixed(2)}
        </span>

        <span
          className="ml-1 hidden text-[12.5px] lg:inline"
          style={{ color: "#A1A1AA" }}
        >
          {sceneLabel}
        </span>

        <button
          type="button"
          onClick={onToggleSound}
          className={iconButton}
          aria-label={soundOn ? "Mute sound design" : "Enable sound design"}
          title={soundOn ? "Mute (S)" : "Enable sound (S)"}
        >
          {soundOn ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
        </button>
        <button
          type="button"
          onClick={onTogglePresent}
          className={iconButton}
          aria-label={
            present ? "Exit presentation mode" : "Enter presentation mode"
          }
          title={present ? "Exit presentation (P)" : "Present (P)"}
        >
          <LuMaximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
