"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { FILM_DURATION } from "./film";

export type FilmCue = { t: number; kind: string };

type Options = {
  /** Optional pre-roll delay (ms) before the timeline starts, e.g. 500. */
  prerollMs: number;
  /** Ordered sound cues; fired when the clock crosses each time. */
  cues: FilmCue[];
  onCue: (kind: string) => void;
  /** When false, the film loads paused at t=0 (frame-inspection mode). */
  autoStart?: boolean;
};

/**
 * The single animation clock for the film. One requestAnimationFrame loop
 * drives `t` (seconds, 0…15); every scene is a pure function of `t`, so
 * pausing, seeking, scrubbing and restarting are all deterministic.
 */
export function useFilmClock({
  prerollMs,
  cues,
  onCue,
  autoStart = true,
}: Options) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const tRef = useRef(0);
  const startRef = useRef(0);
  const playingRef = useRef(false);
  const rafRef = useRef(0);
  const cueIdxRef = useRef(0);
  const cuesRef = useRef(cues);
  const onCueRef = useRef(onCue);
  cuesRef.current = cues;
  onCueRef.current = onCue;

  const stopRaf = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  const frame = useCallback((now: number) => {
    if (!playingRef.current) return;
    const next = Math.min(FILM_DURATION, (now - startRef.current) / 1000);

    /* Fire sound cues exactly as the master clock crosses them. */
    const list = cuesRef.current;
    while (
      cueIdxRef.current < list.length &&
      next >= list[cueIdxRef.current].t
    ) {
      onCueRef.current(list[cueIdxRef.current].kind);
      cueIdxRef.current += 1;
    }

    tRef.current = next;
    setT(next);

    if (next >= FILM_DURATION) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const begin = useCallback(() => {
    setReady(true);
    playingRef.current = true;
    setPlaying(true);
    startRef.current = performance.now();
    cueIdxRef.current = 0;
    stopRaf();
    rafRef.current = requestAnimationFrame(frame);
  }, [frame, stopRaf]);

  /* Wait for fonts (self-hosted, fast) plus the configurable pre-roll, then
     start. Fallback timeout keeps the film from never starting. */
  useEffect(() => {
    let cancelled = false;
    let kickTimer: number | undefined;

    const kick = () => {
      if (cancelled) return;
      if (!autoStart) {
        /* Frame-inspection mode: resolve readiness, stay paused at t=0. */
        setReady(true);
        return;
      }
      kickTimer = window.setTimeout(begin, Math.max(0, prerollMs));
    };

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      Promise.race([
        fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]).then(kick);
    } else {
      kick();
    }

    return () => {
      cancelled = true;
      if (kickTimer !== undefined) window.clearTimeout(kickTimer);
      stopRaf();
    };
  }, [autoStart, begin, prerollMs, stopRaf]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    stopRaf();
  }, [stopRaf]);

  const play = useCallback(() => {
    if (tRef.current >= FILM_DURATION) {
      tRef.current = 0;
      setT(0);
      cueIdxRef.current = 0;
    }
    playingRef.current = true;
    setPlaying(true);
    startRef.current = performance.now() - tRef.current * 1000;
    stopRaf();
    rafRef.current = requestAnimationFrame(frame);
  }, [frame, stopRaf]);

  /** Seek without firing sound cues (used by the scrubber). */
  const seek = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(FILM_DURATION, next));
    tRef.current = clamped;
    setT(clamped);
    cueIdxRef.current = cuesRef.current.filter((c) => c.t <= clamped).length;
    if (playingRef.current) {
      startRef.current = performance.now() - clamped * 1000;
    }
  }, []);

  const restart = useCallback(() => {
    stopRaf();
    tRef.current = 0;
    setT(0);
    cueIdxRef.current = 0;
    startRef.current = performance.now();
    if (!playingRef.current) {
      playingRef.current = true;
      setPlaying(true);
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [frame, stopRaf]);

  return { t, playing, ready, pause, play, restart, seek };
}
