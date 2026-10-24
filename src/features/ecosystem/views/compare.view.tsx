"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { HiMiniXMark, HiOutlineCheck, HiOutlineLink } from "react-icons/hi2";

import {
  type ChartConfig,
  EChartsAreaChart,
} from "@/components/evilcharts/charts/echarts-area-chart";
import { useProjectsQuery } from "@/features/projects/hooks/project.queries";
import type { Project } from "@/features/projects/types/project.type";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { EmptyState } from "@/shared/components/ui/empty-state";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { formatNumberShort } from "@/shared/lib/utils/format-number";
import { formatTimeAgo } from "@/shared/lib/utils/format-time-ago";

const MAX_MODELS = 4;
const SERIES_COLORS = ["#2b7fff", "#0d9488", "#d97706", "#7c3aed"];

const LANGUAGE_SHORT: Record<string, string> = {
  Amharic: "Amharic",
  "Afaan Oromo": "Oromo",
  Tigrinya: "Tigrinya",
  "Ge'ez": "Ge'ez",
  Somali: "Somali",
  "Sidaamu Afoo": "Sidaama",
  Wolayttattoo: "Wolaytta",
  English: "English",
};

function taskOf(project: Project): string | null {
  const cats = project.projectCategories ?? [];
  return cats.length > 1 ? (cats[1]?.name ?? null) : null;
}

function languagesOf(project: Project): string[] {
  const langs = project.repositoryDetails?.languages;
  const list = Array.isArray(langs)
    ? (langs as string[])
    : Object.keys((langs as Record<string, number>) ?? {});
  return list.map((l) => LANGUAGE_SHORT[l] ?? l);
}

function buildChartConfig(models: Project[]): ChartConfig {
  const config: Record<string, unknown> = {};
  models.forEach((m, i) => {
    const color = SERIES_COLORS[i % SERIES_COLORS.length];
    config[m.id as string] = {
      label: m.title,
      colors: { light: [color], dark: [color] },
    };
  });
  return config as ChartConfig;
}

function useModelSearch() {
  const { data } = useProjectsQuery({ categories: "Model", per_page: 250 });
  return data?.data ?? [];
}

function ModelPicker({
  label,
  selected,
  onSelect,
  exclude,
  index,
}: {
  label: string;
  selected: Project[];
  onSelect: (id: string) => void;
  exclude: string[];
  index: number;
}) {
  const models = useModelSearch();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between gap-2 rounded-[12px] border border-muted-black-stroke bg-card px-3.5 text-left text-sm transition-colors hover:bg-secondary/50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
              }}
            />
            <span className="truncate text-primary">
              {label}
              {selected[index] ? "" : ""}
            </span>
          </span>
          <span className="shrink-0 text-muted-foreground text-xs">
            {selected[index] ? "Change" : "Select"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models…" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models
                .filter((m) => !exclude.includes(m.id as string))
                .map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`${m.title} ${m.owner?.name ?? ""}`}
                    onSelect={() => {
                      onSelect(m.id as string);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{m.title}</span>
                    <span className="shrink-0 text-muted-foreground text-xs">
                      {formatNumberShort(m.downloadsMonthly ?? 0)}/mo
                    </span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SpecRow({
  label,
  values,
  bestIndex,
}: {
  label: string;
  values: (string | null)[];
  bestIndex?: number | null;
}) {
  return (
    <tr className="border-muted-black-stroke border-b last:border-b-0">
      <td className="py-2.5 pr-4 align-top text-muted-foreground text-xs">
        {label}
      </td>
      {values.map((value, i) => (
        <td
          key={i}
          className={
            i === bestIndex
              ? "py-2.5 pr-4 align-top font-medium text-primary text-sm tabular-nums"
              : "py-2.5 pr-4 align-top text-primary text-sm tabular-nums"
          }
        >
          {value ?? <span className="text-foreground/25">—</span>}
        </td>
      ))}
    </tr>
  );
}

export default function CompareView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const allModels = useModelSearch();

  const ids = useMemo(() => {
    const raw = searchParams.get("models") ?? "";
    return raw.split(",").filter(Boolean).slice(0, MAX_MODELS);
  }, [searchParams]);

  const selected = useMemo(
    () =>
      ids
        .map((id) => allModels.find((m) => m.id === id))
        .filter((m): m is Project => Boolean(m)),
    [ids, allModels]
  );

  const setIds = (next: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (next.length) params.set("models", next.join(","));
    else params.delete("models");
    const qs = params.toString();
    router.replace(`/compare${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const addModel = (id: string) => {
    if (ids.includes(id) || ids.length >= MAX_MODELS) return;
    setIds([...ids, id]);
  };
  const removeModel = (id: string) => setIds(ids.filter((x) => x !== id));

  const chart = useMemo(() => {
    const dates = [
      ...new Set(
        selected.flatMap(
          (m) =>
            (m.sparkline?.timestamps ?? []).filter(
              (t): t is string => typeof t === "string"
            ) as string[]
        )
      ),
    ].sort();
    const rows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      for (const m of selected) {
        const stamps = m.sparkline?.timestamps ?? [];
        const i = stamps.indexOf(date);
        row[m.id as string] = i >= 0 ? (m.sparkline?.points[i] ?? null) : null;
      }
      return row;
    });
    return { dates, rows };
  }, [selected]);

  const bestDownloads = useMemo(() => {
    let best: number | null = null;
    let index: number | null = null;
    selected.forEach((m, i) => {
      const dl = m.downloadsMonthly ?? 0;
      if (best === null || dl > best) {
        best = dl;
        index = i;
      }
    });
    return best && best > 0 ? index : null;
  }, [selected]);

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Compare models
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Put Ethiopian models side by side — download trajectories over the
          last snapshots, plus the specs that matter: task, languages, license,
          size and lineage. Pick up to four.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: MAX_MODELS }).map((_, i) => {
          const model = selected[i];
          return (
            <div key={i} className="flex items-center gap-2">
              {model ? (
                <div className="flex h-11 w-full items-center justify-between gap-2 rounded-[12px] border border-muted-black-stroke bg-card px-3.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          SERIES_COLORS[i % SERIES_COLORS.length],
                      }}
                    />
                    <span className="truncate text-primary text-sm">
                      {model.title}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeModel(model.id as string)}
                    aria-label={`Remove ${model.title}`}
                    className="shrink-0 text-foreground/30 transition-colors hover:text-primary"
                  >
                    <HiMiniXMark className="size-4" />
                  </button>
                </div>
              ) : (
                <ModelPicker
                  label={`Model ${i + 1}`}
                  selected={selected}
                  onSelect={addModel}
                  exclude={ids}
                  index={i}
                />
              )}
            </div>
          );
        })}
      </div>

      {selected.length < 2 ? (
        <EmptyState
          title="Pick at least two models"
          description="Choose models above to see their download trends overlaid and a side-by-side spec comparison."
          className="my-16"
        />
      ) : (
        <div className="mt-8 flex flex-col gap-6">
          <section className="rounded-[18px] border border-muted-black-stroke bg-card px-5 pt-5 pb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h2
                  className="text-[15px] text-primary tracking-[-0.01em]"
                  style={{ fontFamily: "Aspekta", fontWeight: 500 }}
                >
                  Download trajectory
                </h2>
                <p className="mt-0.5 text-muted-foreground text-xs">
                  Daily downloads across the last {chart.dates.length} snapshots
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyLink}>
                <HiOutlineLink className="size-3.5" />
                Copy link
              </Button>
            </div>
            <EChartsAreaChart
              data={chart.rows}
              config={buildChartConfig(selected)}
              xDataKey="date"
              curveType="smooth"
              className="mt-2 h-64 w-full"
            >
              <EChartsAreaChart.Grid />
              <EChartsAreaChart.XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return d.toLocaleDateString("en", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <EChartsAreaChart.YAxis
                tickFormatter={(value) => formatNumberShort(value)}
              />
              <EChartsAreaChart.Legend isClickable />
              <EChartsAreaChart.Tooltip />
              {selected.map((m) => (
                <EChartsAreaChart.Area
                  key={m.id}
                  dataKey={m.id as string}
                  variant="none"
                  isClickable
                >
                  <EChartsAreaChart.Dot variant="border" />
                  <EChartsAreaChart.ActiveDot variant="colored-border" />
                </EChartsAreaChart.Area>
              ))}
            </EChartsAreaChart>
          </section>

          <section className="overflow-x-auto rounded-[18px] border border-muted-black-stroke bg-card px-5 py-4">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-muted-black-stroke border-b">
                  <th className="w-36 py-2.5 pr-4 font-medium text-foreground/40 text-xs">
                    Spec
                  </th>
                  {selected.map((m, i) => (
                    <th key={m.id} className="py-2.5 pr-4">
                      <span className="flex items-center gap-1.5">
                        <span
                          aria-hidden
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor:
                              SERIES_COLORS[i % SERIES_COLORS.length],
                          }}
                        />
                        <a
                          href={`/projects/${m.id}`}
                          className="truncate font-medium text-primary text-sm hover:underline"
                        >
                          {m.title}
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SpecRow
                  label="Organization"
                  values={selected.map((m) => m.owner?.name ?? null)}
                />
                <SpecRow label="Task" values={selected.map((m) => taskOf(m))} />
                <SpecRow
                  label="Languages"
                  values={selected.map(
                    (m) => languagesOf(m).slice(0, 3).join(", ") || null
                  )}
                />
                <SpecRow
                  label="Downloads / mo"
                  values={selected.map((m) =>
                    formatNumberShort(m.downloadsMonthly ?? 0)
                  )}
                  bestIndex={bestDownloads}
                />
                <SpecRow
                  label="Likes"
                  values={selected.map((m) =>
                    formatNumberShort(m.repositoryDetails?.stars ?? 0)
                  )}
                />
                <SpecRow
                  label="License"
                  values={selected.map((m) =>
                    m.repositoryDetails?.license
                      ? String(m.repositoryDetails.license).toUpperCase()
                      : null
                  )}
                />
                <SpecRow
                  label="Parameters"
                  values={selected.map((m) =>
                    m.paramCount ? formatParams(m.paramCount) : null
                  )}
                />
                <SpecRow
                  label="Base model"
                  values={selected.map((m) => m.baseModel ?? null)}
                />
                <SpecRow
                  label="Last updated"
                  values={selected.map((m) =>
                    m.updatedAt
                      ? formatTimeAgo(new Date(m.updatedAt).toISOString())
                      : null
                  )}
                />
                <SpecRow
                  label="First indexed"
                  values={selected.map((m) =>
                    m.createdAt
                      ? new Date(m.createdAt).toLocaleDateString("en", {
                          month: "short",
                          year: "numeric",
                        })
                      : null
                  )}
                />
              </tbody>
            </table>
          </section>

          <p className="flex items-center gap-1.5 text-foreground/40 text-xs">
            <HiOutlineCheck className="size-3.5" />
            Best monthly downloads are highlighted. Every figure comes from the
            daily scrape.
          </p>
        </div>
      )}
    </div>
  );
}

function formatParams(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}
