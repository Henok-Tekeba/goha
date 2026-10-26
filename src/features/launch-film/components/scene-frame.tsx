"use client";

import type { ReactNode } from "react";

import { seg } from "../lib/film";

/**
 * Scene wrapper: renders only within [start - fade, end + fade] and performs
 * a short cross-dissolve with a subtle vertical drift. All motion is computed
 * from the master clock — no CSS transitions, so unmounting/remounting never
 * causes a flash and scrubbing is exact.
 */
export function SceneFrame({
  t,
  start,
  end,
  children,
  fade = 0.24,
}: {
  t: number;
  start: number;
  end: number;
  children: ReactNode;
  fade?: number;
}) {
  if (t < start - fade || t > end + fade) return null;
  const inP = seg(t, start - fade, start);
  const outP = seg(t, end, end + fade);
  const opacity = Math.min(inP, 1 - outP);
  const y = (1 - inP) * 16 - outP * 10;
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
