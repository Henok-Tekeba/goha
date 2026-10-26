"use client";

// biome-ignore lint/correctness/noUnusedImports: parser false positive — easeOutBack is used in nodeScale() below
import { C, easeOutBack, easeOutCubic, seg } from "../lib/film";

type NodeDef = {
  x: number;
  y: number;
  label: string;
  /** Foundation models are quieter; derivatives carry the accent dot. */
  foundation?: boolean;
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
  { x: 170, y: 140, label: "whisper-small", foundation: true, appearAt: 8.42 },
  { x: 610, y: 140, label: "whisper-amharic-small-v2", appearAt: 8.6 },
  { x: 170, y: 300, label: "w2v-bert-2.0", foundation: true, appearAt: 8.48 },
  { x: 610, y: 252, label: "Ethio-ASR-amharic", appearAt: 8.68 },
  { x: 610, y: 356, label: "Ethio-ASR-oromo", appearAt: 8.76 },
  {
    x: 170,
    y: 462,
    label: "Llama-3.2-1B-Instruct",
    foundation: true,
    appearAt: 8.54,
  },
  { x: 610, y: 462, label: "Llama-3.2-1B-Amharic", appearAt: 8.84 },
  { x: 1010, y: 462, label: "Llama-3.2-1B-Amharic-Instruct", appearAt: 8.94 },
];

const EDGES: EdgeDef[] = [
  { from: 0, to: 1, drawAt: 8.12 },
  { from: 2, to: 3, drawAt: 8.22 },
  { from: 2, to: 4, drawAt: 8.3 },
  { from: 5, to: 6, drawAt: 8.38 },
  { from: 6, to: 7, drawAt: 8.46 },
];

const NODE_W = 264;
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
      style={{ left: 400, top: 250 }}
      width={1120}
      height={540}
      viewBox="0 0 1120 540"
      aria-hidden
    >
      {EDGES.map((edge, i) => {
        const p = seg(t, edge.drawAt, edge.drawAt + 0.38);
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
        const pop = seg(t, node.appearAt, node.appearAt + 0.3);
        if (pop <= 0) return null;
        const s = nodeScale(pop);
        const opacity = Math.min(1, pop * 2.5);
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
              x={node.foundation ? 0 : 10}
              y={5.5}
              textAnchor="middle"
              fontSize={16.5}
              fontWeight={node.foundation ? 500 : 600}
              fill={node.foundation ? C.dim : C.ink}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
