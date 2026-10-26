/**
 * Central timeline constants, palette and easing for the 15-second launch film.
 * Every scene derives its motion from the single clock that reads `t` (seconds).
 */

export const FILM_DURATION = 15;
export const STAGE_W = 1920;
export const STAGE_H = 1080;

/* Palette — goha's own light theme: white stage, neutral-900 ink, and the
   site's interactive blue (--ost-blue-three) as the single accent. */
export const C = {
  bg: "#FFFFFF",
  ink: "#171717",
  dim: "#71717A",
  accent: "#2B7FFF",
  accentSoft: "rgba(43, 127, 255, 0.5)",
  line: "rgba(0, 0, 0, 0.12)",
  lineFaint: "rgba(0, 0, 0, 0.07)",
  panel: "rgba(0, 0, 0, 0.03)",
  panelLine: "rgba(0, 0, 0, 0.10)",
} as const;

/* Geist is self-hosted by the root layout; set it explicitly on the stage so
   every element renders in it regardless of preflight defaults. */
export const FONT_SANS =
  "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif";
export const FONT_MONO = "var(--font-geist-mono), ui-monospace, monospace";

/* Ethiopic glyphs render through the system stack (Kefa / Nyala / Noto) —
   no network font fetch, so font readiness never delays the timeline. */
export const ETHIOPIC_STACK =
  "'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif";

export type SceneWindow = {
  id: string;
  label: string;
  start: number;
  end: number;
};

export const SCENES: SceneWindow[] = [
  { id: "problem", label: "The problem", start: 0, end: 2 },
  { id: "reveal", label: "The reveal", start: 2, end: 4 },
  { id: "stats", label: "The ecosystem", start: 4, end: 7 },
  { id: "capabilities", label: "Capabilities", start: 7, end: 10 },
  { id: "open-data", label: "Open data", start: 10, end: 12 },
  { id: "finale", label: "goha", start: 12, end: 15 },
];

export function activeScene(t: number): string {
  for (const scene of SCENES) {
    if (t < scene.end) return scene.id;
  }
  return SCENES[SCENES.length - 1].id;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalised progress of `t` inside the window [a, b]. */
export const seg = (t: number, a: number, b: number) =>
  clamp01((t - a) / (b - a));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const easeOutQuint = (p: number) => 1 - (1 - p) ** 5;
export const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - 2 ** (-10 * p));
export const easeOutCubic = (p: number) => 1 - (1 - p) ** 3;
export const easeInCubic = (p: number) => p * p * p;
export const easeInOutCubic = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
export const easeOutBack = (p: number, overshoot = 1.35) => {
  const c = overshoot + 1;
  return 1 + c * (p - 1) ** 3 + overshoot * (p - 1) ** 2;
};
