"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Host for a real evilcharts component on the 1920×1080 film stage.
 *
 * evilcharts hardcodes its typography (10px axis labels, 16px legend) for
 * ~1100px-wide cards — at stage scale that text would be unreadably small.
 * The chart therefore renders at 1/scale size and is scaled back up with CSS:
 * same proportions as the site, legible type on the stage. The SVG renderer
 * keeps every stroke crisp under both this scale and the stage's own uniform
 * scale, and pointer events are dropped — nothing on the stage is hoverable.
 */
export function FilmChart({
  left,
  top,
  width,
  height,
  scale = 2,
  opacity = 1,
  style,
  children,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  scale?: number;
  opacity?: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute"
      style={{
        left,
        top,
        width,
        height,
        opacity,
        willChange: "opacity",
        ...style,
      }}
    >
      <div
        style={{
          width: width / scale,
          height: height / scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
