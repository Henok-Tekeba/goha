"use client";

import { easeOutExpo, seg } from "../lib/film";

/**
 * Count-up number driven entirely by the master clock — deterministic,
 * scrubbable, no timers of its own.
 */
export function AnimatedNumber({
  t,
  target,
  start,
  duration = 0.9,
  format,
  className,
  style,
}: {
  t: number;
  target: number;
  start: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const p = easeOutExpo(seg(t, start, start + duration));
  const value = Math.round(p * target);
  return (
    <span
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", ...style }}
    >
      {format ? format(value) : value}
    </span>
  );
}
