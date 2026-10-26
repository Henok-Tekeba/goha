"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DevControls } from "./components/dev-controls";
import { SceneCapabilities } from "./components/scene-capabilities";
import { SceneFinale } from "./components/scene-finale";
import { SceneFrame } from "./components/scene-frame";
import { SceneOpenData } from "./components/scene-open-data";
import { SceneProblem } from "./components/scene-problem";
import { SceneReveal } from "./components/scene-reveal";
import { SceneStats } from "./components/scene-stats";
import {
  activeScene,
  C,
  FILM_DURATION,
  SCENES,
  STAGE_H,
  STAGE_W,
} from "./lib/film";
import { FilmAudio } from "./lib/film-audio";
import { type FilmCue, useFilmClock } from "./lib/use-film-clock";

/* Sound cues — all synthesized, optional, and driven by the master clock. */
const SOUND_CUES: FilmCue[] = [
  { t: 0.18, kind: "click" },
  { t: 0.31, kind: "click" },
  { t: 0.44, kind: "click" },
  { t: 0.57, kind: "click" },
  { t: 1.1, kind: "click" },
  { t: 2.02, kind: "impact" },
  { t: 2.62, kind: "pluck" },
  { t: 4.42, kind: "tick" },
  { t: 4.72, kind: "tick" },
  { t: 5.0, kind: "tick" },
  { t: 5.3, kind: "tick" },
  { t: 5.78, kind: "tick" },
  { t: 7.05, kind: "click" },
  { t: 8.05, kind: "click" },
  { t: 9.05, kind: "click" },
  { t: 10.18, kind: "tick" },
  { t: 10.32, kind: "tick" },
  { t: 10.46, kind: "tick" },
  { t: 10.6, kind: "tick" },
  { t: 11.24, kind: "click" },
  { t: 12.06, kind: "impact" },
  { t: 12.62, kind: "chord" },
  { t: 13.3, kind: "tick" },
];

/**
 * LaunchFilm — one 1920×1080 stage, one rAF clock, six scenes.
 * The stage scales uniformly to the viewport (16:9 letterboxed on the same
 * background), and a development control bar lives outside the stage.
 */
export default function LaunchFilmView() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<FilmAudio | null>(null);
  if (!audioRef.current && typeof window !== "undefined") {
    audioRef.current = new FilmAudio();
  }

  const [present, setPresent] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  /* Optional pre-roll (~500 ms default), configurable via ?preroll=ms. */
  const prerollMs = useMemo(() => {
    if (typeof window === "undefined") return 500;
    const raw = new URLSearchParams(window.location.search).get("preroll");
    const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
    return Number.isFinite(value) && value >= 0 ? value : 500;
  }, []);

  const onCue = useCallback((kind: string) => {
    audioRef.current?.play(kind);
  }, []);

  /* Frame inspection: ?t=8.5 renders exactly that frame, paused. */
  const frameParam = useMemo(() => {
    if (typeof window === "undefined") return null;
    const raw = new URLSearchParams(window.location.search).get("t");
    if (!raw) return null;
    const value = Number.parseFloat(raw);
    return Number.isFinite(value)
      ? Math.max(0, Math.min(FILM_DURATION, value))
      : null;
  }, []);

  const {
    t: filmT,
    playing,
    pause,
    play,
    restart,
    seek,
  } = useFilmClock({
    prerollMs,
    cues: SOUND_CUES,
    onCue,
    autoStart: frameParam == null,
  });

  /* Presentation mode from ?present=1. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("present") === "1") setPresent(true);
    if (frameParam != null) seek(frameParam);
  }, [seek, frameParam]);

  /* Uniform stage scaling (16:9, no distortion). */
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const measure = () => {
      const width = wrapperRef.current?.clientWidth ?? window.innerWidth;
      const height = wrapperRef.current?.clientHeight ?? window.innerHeight;
      setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const togglePresent = useCallback(() => {
    setPresent((prev) => {
      const next = !prev;
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("present", "1");
      else url.searchParams.delete("present");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.searchParams.has("present") ? "?present=1" : ""}`
      );
      if (next) {
        wrapperRef.current?.requestFullscreen?.().catch(() => {});
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      audioRef.current?.setEnabled(next);
      if (next) audioRef.current?.ensure();
      return next;
    });
  }, []);

  /* Keyboard shortcuts: R restart, Space play/pause, P present, S sound,
     arrows seek ±0.5s. */
  const tMirror = useRef(0);
  tMirror.current = filmT;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        restart();
      } else if (e.key === " ") {
        e.preventDefault();
        if (playing) pause();
        else play();
      } else if (e.key === "p" || e.key === "P") {
        togglePresent();
      } else if (e.key === "s" || e.key === "S") {
        toggleSound();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(0, tMirror.current - 0.5));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seek(Math.min(FILM_DURATION, tMirror.current + 0.5));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playing, pause, play, restart, seek, togglePresent, toggleSound]);

  const sceneLabel =
    SCENES.find((s) => s.id === activeScene(filmT))?.label ?? "";

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 overflow-hidden"
      style={{ background: C.bg }}
    >
      {/* Screen-reader description of the film */}
      <h1 className="sr-only">
        goha — Making Ethiopian AI legible. A 15-second launch film.
      </h1>

      {/* The 1920×1080 stage, uniformly scaled to the viewport */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden
          className="relative shrink-0 overflow-hidden"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            background: C.bg,
            transform: `scale(${scale})`,
            transformOrigin: "center",
          }}
        >
          <SceneFrame t={filmT} start={0} end={2}>
            <SceneProblem t={filmT} />
          </SceneFrame>
          <SceneFrame t={filmT} start={2} end={4}>
            <SceneReveal t={filmT} />
          </SceneFrame>
          <SceneFrame t={filmT} start={4} end={7}>
            <SceneStats t={filmT} />
          </SceneFrame>
          <SceneFrame t={filmT} start={7} end={10}>
            <SceneCapabilities t={filmT} />
          </SceneFrame>
          <SceneFrame t={filmT} start={10} end={12}>
            <SceneOpenData t={filmT} />
          </SceneFrame>
          <SceneFrame t={filmT} start={12} end={15}>
            <SceneFinale t={filmT} />
          </SceneFrame>
        </div>
      </div>

      {!present && (
        <DevControls
          t={filmT}
          playing={playing}
          sceneLabel={sceneLabel}
          soundOn={soundOn}
          present={present}
          onRestart={restart}
          onTogglePlay={() => (playing ? pause() : play())}
          onSeek={seek}
          onToggleSound={toggleSound}
          onTogglePresent={togglePresent}
        />
      )}
    </div>
  );
}
