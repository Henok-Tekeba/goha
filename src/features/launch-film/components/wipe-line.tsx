"use client";

import type { CSSProperties, ReactNode } from "react";

import { C, easeInCubic, easeOutQuint, seg } from "../lib/film";

/**
 * A crisp clip-wipe text reveal: masked left-to-right entrance with a small
 * upward settle. Two placement modes:
 *  - "absolute" (default): centered at (x, y) on the stage.
 *  - "relative": flows inline (inside a flex row), only the entrance motion.
 * Used for every major headline so the type language stays consistent.
 */
export function WipeLine({
  t,
  start,
  end,
  size,
  weight = 800,
  tracking = "-0.025em",
  color = C.ink,
  x,
  y,
  children,
  exitAt,
  exitDuration = 0.26,
  ethiopic = false,
  mode = "absolute",
  style,
}: {
  t: number;
  start: number;
  end: number;
  size: number;
  weight?: number;
  tracking?: string;
  color?: string;
  x?: number | string;
  y?: number;
  children: ReactNode;
  exitAt?: number;
  exitDuration?: number;
  ethiopic?: boolean;
  mode?: "absolute" | "relative";
  style?: CSSProperties;
}) {
  const p = easeOutQuint(seg(t, start, end));
  if (p <= 0) return null;

  const outP = exitAt ? easeInCubic(seg(t, exitAt, exitAt + exitDuration)) : 0;
  if (outP >= 1) return null;

  const inY = (1 - p) * 20;
  const outY = outP * -18;
  const opacity = Math.min(1, p * 3) * (1 - outP);
  const clip = 100 - 100 * p;

  const placement: CSSProperties =
    mode === "absolute"
      ? {
          left: x ?? "50%",
          top: y ?? 0,
          transform: `translate(-50%, calc(-50% + ${inY + outY}px))`,
        }
      : {
          transform: `translateY(${inY + outY}px)`,
        };

  return (
    <div
      className={
        mode === "absolute"
          ? "absolute whitespace-nowrap text-center"
          : "whitespace-nowrap"
      }
      style={{
        ...placement,
        opacity,
        clipPath: `inset(-20% ${clip}% -20% -20%)`,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        lineHeight: 1.06,
        color,
        fontFamily: ethiopic
          ? "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif"
          : undefined,
        willChange: "transform, opacity, clip-path",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
