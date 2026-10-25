"use client";

import { GraphChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import type { LineageNode, LineagePayload } from "../types/ecosystem.types";

echarts.use([GraphChart, TooltipComponent, CanvasRenderer]);

/* restrained categorical ramp — distinct enough to separate families,
   muted enough to sit inside the app's neutral palette */
const FAMILY_COLORS: Record<string, string> = {
  Llama: "#2b7fff",
  Qwen: "#7c3aed",
  Gemma: "#0d9488",
  Mistral: "#d97706",
  "GPT-2": "#db2777",
  "Other LLM": "#64748b",
  "BERT family": "#4f46e5",
  "w2v-BERT": "#0891b2",
  "Ethio-ASR": "#059669",
  wav2vec: "#16a34a",
  Whisper: "#2563eb",
  TTS: "#c026d3",
  T5: "#ca8a04",
  NLLB: "#ea580c",
  MMS: "#0f766e",
  Embeddings: "#9333ea",
  OCR: "#475569",
  Vision: "#be185d",
  Video: "#dc2626",
  Diffusion: "#78716c",
  Other: "#737373",
};

function colorFor(family: string): string {
  return FAMILY_COLORS[family] ?? "#737373";
}

function buildOption(
  nodes: LineageNode[],
  links: { source: string; target: string }[]
) {
  const ids = new Set(nodes.map((n) => n.id));
  const filteredLinks = links.filter(
    (l) => ids.has(l.source) && ids.has(l.target)
  );

  return {
    animation: true,
    animationDuration: 500,
    animationEasing: "cubicOut" as const,
    tooltip: {
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(0,0,0,0.08)",
      borderWidth: 1,
      padding: [10, 12],
      textStyle: { color: "#171717", fontSize: 12 },
      extraCssText:
        "box-shadow:0 8px 28px -12px rgba(0,0,0,0.18);border-radius:12px;",
      formatter: (params: unknown) => {
        const p = params as { dataType?: string; data?: LineageNode };
        if (p.dataType !== "node" || !p.data) return "";
        const n = p.data;
        const meta = [
          n.task,
          n.langs?.slice(0, 2).join(", "),
          n.downloads > 0
            ? `${formatNumberShort(n.downloads)} downloads/mo`
            : null,
        ]
          .filter(Boolean)
          .join(" · ");
        return `<div style="max-width:240px">
          <div style="font-weight:500;font-size:12px;line-height:1.35">${escapeHtml(n.name)}</div>
          <div style="color:#8a8a8a;font-size:11px;margin-top:2px">${escapeHtml(n.org ?? "")}${n.external ? " · foundation model" : ""}</div>
          ${meta ? `<div style="color:#525252;font-size:11px;margin-top:4px">${escapeHtml(meta)}</div>` : ""}
          <div style="color:#a3a3a3;font-size:10px;margin-top:6px">${n.projectId ? "Click to open on goha →" : n.external ? "Click to open on Hugging Face ↗" : ""}</div>
        </div>`;
      },
    },
    series: [
      {
        type: "graph",
        layout: "none",
        roam: true,
        draggable: false,
        zoom: 0.9,
        data: nodes.map((n) => ({
          id: n.id,
          name: n.name,
          x: n.x,
          y: n.y,
          symbolSize: Math.max(
            9,
            Math.min(30, 9 + Math.sqrt(Math.max(0, n.downloads)) / 7)
          ),
          itemStyle: {
            color: n.external ? "#ffffff" : colorFor(n.family),
            borderColor: colorFor(n.family),
            borderWidth: n.external ? 2 : 1,
          },
          label: {
            show: nodes.length <= 40 || n.external || n.downloads >= 300,
            position: "right" as const,
            fontSize: 10,
            color: "#525252",
            distance: 6,
            formatter: () =>
              n.name.length > 26 ? `${n.name.slice(0, 24)}…` : n.name,
          },
          projectId: n.projectId,
          external: n.external,
          downloads: n.downloads,
        })),
        links: filteredLinks.map((l) => ({
          source: l.source,
          target: l.target,
        })),
        edgeSymbol: ["none", "arrow"],
        edgeSymbolSize: 4,
        lineStyle: { color: "#00000026", curveness: 0.12, width: 1 },
        emphasis: {
          focus: "adjacency" as const,
          lineStyle: { width: 2, color: "#2b7fff", opacity: 1 },
          itemStyle: { borderColor: "#171717" },
        },
      },
    ],
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function LineageGraph({
  payload,
  className,
}: {
  payload: LineagePayload;
  className?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const families = useMemo(() => {
    const list = payload?.families ?? [];
    return [...list].sort((a, b) => b.models - a.models);
  }, [payload]);

  /* default to the family with the most indexed models — the richest tree */
  const activeFamily = useMemo(() => {
    return selected ?? families[0]?.family ?? null;
  }, [selected, families]);

  const visible = useMemo(() => {
    if (!payload || !activeFamily) return { nodes: [], links: [] };
    const nodes = payload.nodes.filter((n) => n.family === activeFamily);
    const ids = new Set(nodes.map((n) => n.id));
    const links = payload.links.filter(
      (l) => ids.has(l.source) && ids.has(l.target)
    );
    return { nodes, links };
  }, [payload, activeFamily]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current, null, {
      renderer: "canvas",
    });
    chartRef.current = chart;
    /* the container can settle after fonts/layout — resize once painted */
    const raf = requestAnimationFrame(() => chart.resize());
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || visible.nodes.length === 0) return;
    chart.setOption(buildOption(visible.nodes, visible.links), {
      notMerge: true,
    });

    const onClick = (params: unknown) => {
      const p = params as {
        dataType?: string;
        data?: { projectId?: string | null; external?: boolean; id?: string };
      };
      if (p.dataType !== "node" || !p.data) return;
      if (p.data.projectId) router.push(`/projects/${p.data.projectId}`);
      else if (p.data.external && p.data.id)
        window.open(
          `https://huggingface.co/${p.data.id}`,
          "_blank",
          "noopener,noreferrer"
        );
    };
    chart.off("click");
    chart.on("click", onClick);
  }, [visible, router]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {families.map((family) => (
          <button
            key={family.family}
            type="button"
            onClick={() => setSelected(family.family)}
            aria-pressed={activeFamily === family.family}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs tracking-tight transition-colors",
              activeFamily === family.family
                ? "border-transparent bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ backgroundColor: colorFor(family.family) }}
            />
            {family.family}
            <span
              className={
                activeFamily === family.family
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }
            >
              {family.count}
            </span>
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-[18px] border border-muted-black-stroke bg-white">
        <div
          ref={containerRef}
          className="h-[560px] w-full"
          role="img"
          aria-label={`Model lineage graph for the ${activeFamily ?? "selected"} family`}
        />
        <p className="pointer-events-none absolute right-4 bottom-3 text-[10px] text-muted-foreground">
          drag to pan · scroll to zoom · click a node
        </p>
      </div>

      {activeFamily && payload && (
        <p className="text-muted-foreground text-xs">
          {payload.families.find((f) => f.family === activeFamily)?.models ?? 0}{" "}
          indexed models in the {activeFamily} family — outlined nodes are the
          foundation models they descend from.{" "}
          <span className="text-muted-foreground">
            {payload.stats.models} models across {payload.stats.families}{" "}
            families in total.
          </span>
        </p>
      )}

      {activeFamily && (
        <details className="rounded-[16px] border border-muted-black-stroke bg-white px-4 py-3">
          <summary className="cursor-pointer select-none font-medium text-primary text-sm">
            Data table — {activeFamily} family ({visible.nodes.length} nodes)
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                Lineage nodes in the {activeFamily} family, with their task,
                languages and source.
              </caption>
              <thead>
                <tr className="border-muted-black-stroke border-b text-muted-foreground text-xs">
                  <th className="py-2 pr-3 font-medium">Model</th>
                  <th className="py-2 pr-3 font-medium">Publisher</th>
                  <th className="py-2 pr-3 font-medium">Task</th>
                  <th className="py-2 pr-3 font-medium">Languages</th>
                  <th className="py-2 pr-3 text-right font-medium">
                    Downloads
                  </th>
                  <th className="py-2 text-right font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {[...visible.nodes]
                  .sort((a, b) => b.downloads - a.downloads)
                  .map((node) => (
                    <tr
                      key={node.id}
                      className="border-muted-black-stroke border-b last:border-b-0"
                    >
                      <td className="py-2 pr-3 text-primary">{node.name}</td>
                      <td className="py-2 pr-3 text-muted-foreground text-xs">
                        {node.org ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground text-xs">
                        {node.task ?? "—"}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground text-xs">
                        {node.langs.slice(0, 3).join(", ") || "—"}
                      </td>
                      <td className="py-2 pr-3 text-right text-muted-foreground text-xs tabular-nums">
                        {node.downloads > 0
                          ? formatNumberShort(node.downloads)
                          : "—"}
                      </td>
                      <td className="py-2 text-right text-xs">
                        {node.projectId ? (
                          <Link
                            href={`/projects/${node.projectId}`}
                            className="text-primary underline underline-offset-4"
                          >
                            goha
                          </Link>
                        ) : node.external ? (
                          <a
                            href={`https://huggingface.co/${node.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4"
                          >
                            Hugging Face
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
