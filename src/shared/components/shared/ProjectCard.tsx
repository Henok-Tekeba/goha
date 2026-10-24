"use client";

import Link from "next/link";
import { HiArrowTrendingUp, HiStar } from "react-icons/hi2";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

/* Card identity system: every asset type gets one quiet tint, shared by the
   monogram tile, the type chip and the trend line — so the card reads as a
   single surface instead of a pile of detached widgets. */
const TINTS = {
  model: {
    tile: "bg-blue-500/10 text-blue-600",
    chip: "bg-blue-500/10 text-blue-700",
    stroke: "#3b82f6",
  },
  dataset: {
    tile: "bg-teal-500/10 text-teal-700",
    chip: "bg-teal-500/10 text-teal-700",
    stroke: "#14b8a6",
  },
  company: {
    tile: "bg-amber-500/12 text-amber-700",
    chip: "bg-amber-500/12 text-amber-700",
    stroke: "#f59e0b",
  },
  research: {
    tile: "bg-violet-500/10 text-violet-700",
    chip: "bg-violet-500/10 text-violet-700",
    stroke: "#8b5cf6",
  },
} as const;

type Kind = keyof typeof TINTS;

function kindFromLabel(label?: string | null): Kind {
  switch ((label ?? "").toLowerCase()) {
    case "dataset":
      return "dataset";
    case "company":
      return "company";
    case "research":
      return "research";
    default:
      return "model";
  }
}

const LANGUAGE_SHORT: Record<string, string> = {
  Amharic: "Amharic",
  "Afaan Oromo": "Oromo",
  Tigrinya: "Tigrinya",
  "Ge'ez": "Ge'ez",
  Somali: "Somali",
  "Sidaamu Afoo": "Sidaama",
  Wolayttattoo: "Wolaytta",
  Hadiyya: "Hadiyya",
  Afaraf: "Afar",
  English: "English",
};

/* ---------- inline trend — part of the metric, not a floating ornament ---------- */
function MiniTrend({ points, stroke }: { points: number[]; stroke: string }) {
  if (!points || points.length < 2) return null;
  const w = 52;
  const h = 20;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = h - pad - ((p - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c}`).join(" ");
  const area = `${line} L ${(w - pad).toFixed(1)},${h - 1} L ${pad},${h - 1} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={area} fill={stroke} opacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Monogram({
  name,
  tint,
}: {
  name: string;
  tint: (typeof TINTS)[Kind];
}) {
  const initial =
    (name || "?")
      .replace(/[^a-zA-Z0-9]/g, "")
      .charAt(0)
      .toUpperCase() || "?";
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-[11px] font-semibold text-[15px]",
        tint.tile
      )}
    >
      {initial}
    </span>
  );
}

interface ProjectCardProps {
  projectId?: string;
  title: string;
  description?: string;
  repoUrl?: string | null;
  logoUrl?: string | null;
  ownerName?: string | null;
  kindLabel?: string | null;
  taskLabel?: string | null;
  downloadsMonthly?: number | null;
  growth?: number | null;
  sparkline?: { points: number[] } | null;
  repositoryDetails?: {
    stars?: number | null;
    languages?: unknown;
    license?: string | null;
  } | null;
  isRepositoryLoading?: boolean;
  className?: string;
}

export default function ProjectCardComponent({
  projectId,
  title = "",
  description = "",
  repoUrl = "",
  ownerName = null,
  kindLabel = null,
  taskLabel = null,
  downloadsMonthly = 0,
  growth = null,
  sparkline = null,
  repositoryDetails = null,
  isRepositoryLoading = false,
  className,
}: ProjectCardProps) {
  const kind = kindFromLabel(kindLabel);
  const tint = TINTS[kind];

  const org =
    ownerName ?? (repoUrl ? extractOwner(repoUrl) : null) ?? "goha.et";

  const languages: string[] = Array.isArray(repositoryDetails?.languages)
    ? (repositoryDetails?.languages as string[])
    : Object.keys(
        (repositoryDetails?.languages as Record<string, number>) ?? {}
      );
  const language = languages[0]
    ? (LANGUAGE_SHORT[languages[0]] ?? languages[0])
    : null;
  const license = repositoryDetails?.license ?? null;
  const stars = repositoryDetails?.stars ?? 0;
  const hasDownloads = (downloadsMonthly ?? 0) > 0;
  const hasFooter =
    hasDownloads ||
    stars > 0 ||
    Boolean(language) ||
    Boolean(license) ||
    isRepositoryLoading;

  return (
    <Link
      href={`/projects/${projectId}`}
      className={cn("block h-full outline-none", className)}
      aria-label={`Open ${title} — ${org}`}
    >
      <article className="flex h-full flex-col rounded-[18px] border border-muted-black-stroke bg-white px-5 pt-5 pb-4 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_32px_-14px_rgb(0_0_0/0.14)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <header className="flex items-start gap-3">
          <Monogram name={org} tint={tint} />
          <div className="min-w-0 flex-1">
            <h3
              className="truncate font-medium text-[15px] text-primary leading-5 tracking-[-0.01em]"
              title={title}
            >
              {title}
            </h3>
            <p className="mt-0.5 truncate text-muted-foreground text-xs">
              {org}
            </p>
          </div>
          {(taskLabel ?? kindLabel) && (
            <span
              className={cn(
                "mt-0.5 shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px] uppercase tracking-[0.04em]",
                tint.chip
              )}
            >
              {taskLabel ?? kindLabel}
            </span>
          )}
        </header>

        {description && (
          <p className="mt-3 line-clamp-2 text-[13px] text-muted-foreground leading-[1.5]">
            {description}
          </p>
        )}

        {hasFooter && (
          <footer className="mt-auto flex items-center gap-2 pt-4">
            {hasDownloads ? (
              <div className="flex min-w-0 items-center gap-2">
                {sparkline?.points && sparkline.points.length > 1 && (
                  <MiniTrend points={sparkline.points} stroke={tint.stroke} />
                )}
                <span className="text-[13px] text-primary tabular-nums">
                  <span className="font-medium">
                    {formatNumberShort(downloadsMonthly)}
                  </span>
                  <span className="ml-0.5 text-muted-foreground text-xs">
                    /mo
                  </span>
                </span>
                {typeof growth === "number" && growth > 0 && (
                  <span className="flex items-center gap-0.5 font-medium text-[11px] text-emerald-600 tabular-nums">
                    <HiArrowTrendingUp className="size-3" />
                    {growth}%
                  </span>
                )}
              </div>
            ) : isRepositoryLoading ? (
              <span className="h-4 w-16 animate-pulse rounded bg-black/5" />
            ) : stars > 0 ? (
              <span className="flex items-center gap-1 text-[13px] text-primary tabular-nums">
                <HiStar className="size-3.5 text-black/30" />
                {formatNumberShort(stars)}
              </span>
            ) : null}

            <div className="ml-auto flex items-center gap-2.5 text-[11px] text-muted-foreground">
              {hasDownloads && stars > 0 && (
                <span className="flex items-center gap-0.5 tabular-nums">
                  <HiStar className="size-3 text-black/25" />
                  {formatNumberShort(stars)}
                </span>
              )}
              {language && <span className="truncate">{language}</span>}
              {license && (
                <span className="uppercase tracking-[0.04em]">
                  {String(license).slice(0, 8)}
                </span>
              )}
            </div>
          </footer>
        )}
      </article>
    </Link>
  );
}

function extractOwner(repoUrl: string): string | null {
  const match = repoUrl
    .replace(/^[a-zA-Z]+:\/\/[^/]+\//, "")
    .replace(/^git@[^:]+:/, "")
    .split("/")[0];
  return match || null;
}
