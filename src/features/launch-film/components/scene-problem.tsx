"use client";

import { ScatteredNodes, SourceFragments } from "./source-fragments";
import { WipeLine } from "./wipe-line";

/**
 * Scene 1 — 00:00–00:02 — The problem.
 * Interface fragments enter from different directions and briefly overlap;
 * dashed connectors try and fail to join them. The headline lands in two
 * fast stages.
 */
export function SceneProblem({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      <SourceFragments t={t} />
      <ScatteredNodes t={t} />

      <WipeLine
        t={t}
        start={0.35}
        end={0.9}
        exitAt={1.02}
        size={92}
        x="50%"
        y={880}
      >
        Ethiopian AI is everywhere.
      </WipeLine>
      <WipeLine
        t={t}
        start={1.1}
        end={1.68}
        exitAt={1.78}
        exitDuration={0.2}
        size={92}
        x="50%"
        y={880}
      >
        Its resources are scattered.
      </WipeLine>
    </div>
  );
}
