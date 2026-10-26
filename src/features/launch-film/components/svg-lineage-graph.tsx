"use client";

// biome-ignore lint/correctness/noUnusedImports: parser false positive — easeOutBack is used in nodeScale() below
import { C, easeOutBack, easeOutCubic, seg } from "../lib/film";

type NodeDef = {
  x: number;
  y: number;
  label: string;
  /** Foundation models are quieter; derivatives carry the accent dot. */
  foundation?: boolean;
  /** Declared language of the derived model (real, from the index). */
  glyph?: string;
  appearAt: number;
};

type EdgeDef = {
  from: number;
  to: number;
  drawAt: number;
};

/**
 * Real lineage edges from the index (each child's declared base_model):
 *   meta-llama/Llama-3.2-1B-Instruct → rasyosef/Llama-3.2-1B-Amharic
 *     → rasyosef/Llama-3.2-1B-Amharic-Instruct
 *   openai/whisper-small → chappM/whisper-amharic-small-v2
 *   facebook/w2v-bert-2.0 → badrex/Ethio-ASR-amharic, badrex/Ethio-ASR-oromo
 */
const NODES: NodeDef[] = [
  { x: 170, y: 140, label: "whisper-small", foundation: true, appearAt: 13.9 },
  {
    x: 610,
    y: 140,
    label: "whisper-amharic-small-v2",
    glyph: "አ",
    appearAt: 14.0,
  },
  { x: 170, y: 300, label: "w2v-bert-2.0", foundation: true, appearAt: 13.99 },
  { x: 610, y: 252, label: "Ethio-ASR-amharic", glyph: "አ", appearAt: 14.09 },
  { x: 610, y: 356, label: "Ethio-ASR-oromo", glyph: "O", appearAt: 14.16 },
  {
    x: 170,
    y: 462,
    label: "Llama-3.2-1B-Instruct",
    foundation: true,
    appearAt: 14.07,
  },
  {
    x: 610,
    y: 462,
    label: "Llama-3.2-1B-Amharic",
    glyph: "አ",
    appearAt: 14.17,
  },
  {
    x: 1010,
    y: 462,
    label: "Llama-3.2-1B-Amharic-Instruct",
    glyph: "አ",
    appearAt: 14.27,
  },
];

const EDGES: EdgeDef[] = [
  { from: 0, to: 1, drawAt: 13.75 },
  { from: 2, to: 3, drawAt: 13.84 },
  { from: 2, to: 4, drawAt: 13.93 },
  { from: 5, to: 6, drawAt: 14.02 },
  { from: 6, to: 7, drawAt: 14.11 },
];

const NODE_W = 300;
const NODE_H = 52;

function edgePath(from: NodeDef, to: NodeDef) {
  const x1 = from.x + NODE_W / 2 - 6;
  const y1 = from.y;
  const x2 = to.x - NODE_W / 2 + 6;
  const y2 = to.y;
  const dx = Math.max(40, (x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function nodeScale(p: number) {
  /* Pop-in with a slight settle (easeOutBack), from 60% to 100%. */
  return 0.6 + 0.4 * easeOutBack(p);
}

/**
 * Animated directed lineage graph. Edges draw first (normalized
 * stroke-dash), then nodes pop in — ancestry made visible.
 */
export function SvgLineageGraph({ t }: { t: number }) {
  return (
    <svg
      className="absolute"
      style={{ left: 360, top: 250 }}
      width={1200}
      height={540}
      viewBox="0 0 1200 540"
      aria-hidden
    >
      {EDGES.map((edge, i) => {
        const p = seg(t, edge.drawAt, edge.drawAt + 0.4);
        if (p <= 0) return null;
        return (
          <path
            key={i}
            d={edgePath(NODES[edge.from], NODES[edge.to])}
            fill="none"
            stroke={C.accent}
            strokeWidth={1.6}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
            opacity={0.8}
          />
        );
      })}

      {NODES.map((node, i) => {
        const p = seg(t, node.appearAt, node.appearAt + 0.3);
        if (p <= 0) return null;
        const s = nodeScale(p);
        const opacity = Math.min(1, p * 2.5);
        return (
          <g
            key={i}
            transform={`translate(${node.x} ${node.y}) scale(${s})`}
            opacity={opacity}
          >
            <rect
              x={-NODE_W / 2}
              y={-NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={12}
              fill={C.panel}
              stroke={
                node.foundation ? "rgba(0,0,0,0.22)" : "rgba(43,127,255,0.5)"
              }
              strokeWidth={1}
            />
            {!node.foundation && (
              <circle cx={-NODE_W / 2 + 20} cy={0} r={4} fill={C.accent} />
            )}
            <text
              x={node.foundation || node.glyph ? 0 : 10}
              y={5.5}
              textAnchor="middle"
              fontSize={16}
              fontWeight={node.foundation ? 500 : 600}
              fill={node.foundation ? C.dim : C.ink}
            >
              {node.label}
            </text>
            {node.glyph && (
              <text
                x={NODE_W / 2 - 22}
                y={6}
                textAnchor="middle"
                fontSize={16}
                fill={C.dim}
                fontFamily="'Noto Sans Ethiopic', 'Kefa', 'Nyala', 'Ebrima', sans-serif"
              >
                {node.glyph}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
