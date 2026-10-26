"use client";

import { ScatteredNodes, SourceFragments } from "./source-fragments";
import { WipeLine } from "./wipe-line";

/**
 * Scene 1 — 00:00–00:03.6 — The problem.
 * Interface fragments enter from different directions and briefly overlap;
 * dashed connectors try and fail to join them. The headline lands in two
 * unhurried stages.
 */
export function SceneProblem({ t }: { t: number }) {
  return (
    <div className="absolute inset-0">
      <SourceFragments t={t} />
      <ScatteredNodes t={t} />

      <WipeLine
        t={t}
        start={0.9}
        end={1.6}
        exitAt={2.05}
        exitDuration={0.25}
        size={92}
        x="50%"
        y={880}
      >
        Ethiopian AI is being built.
      </WipeLine>
      <WipeLine t={t} start={2.15} end={2.9} size={92} x="50%" y={880}>
        But nobody can find it.
      </WipeLine>
    </div>
  );
}
