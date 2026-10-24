"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getLineage } from "@/shared/lib/local-data.client";
import LineageGraph from "../components/lineage-graph.component";

export default function LineageView() {
  const { data } = useQuery({
    queryKey: ["ecosystem", "lineage-page"],
    queryFn: () => getLineage(),
  });

  return (
    <div className="mx-auto max-w-6xl px-6">
      <header className="mb-8">
        <p className="mb-2 font-medium text-black/40 text-xs uppercase tracking-[0.08em]">
          Model lineage
        </p>
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          The family tree of Ethiopian AI
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Every Ethiopian model is a descendant of a foundation model — a
          Whisper, a Llama, a w2v-BERT. This is the genealogy, drawn from the{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">
            base_model
          </code>{" "}
          each author declared on Hugging Face. Pick a family to follow a
          lineage; outlined nodes are the foundations themselves.
        </p>
        {data && (
          <p className="mt-3 text-muted-foreground text-xs tabular-nums">
            {data.stats.models} models · {data.stats.foundations} foundations ·{" "}
            {data.stats.families} families
          </p>
        )}
      </header>

      <LineageGraph />

      <section className="mt-10 rounded-[18px] border border-muted-black-stroke px-5 py-4">
        <h2 className="font-medium text-primary text-sm tracking-tight">
          How this is built
        </h2>
        <p className="mt-2 max-w-3xl text-muted-foreground text-xs leading-relaxed">
          goha reads the <code className="text-[11px]">base_model</code> field
          from every model card in the daily Hugging Face sweep, resolves bare
          names to their indexed ids, and lays the graph out as a layered DAG —
          roots on the left, derivations to the right. A model can be both a
          child and a parent (for example, an Amharic Llama that is then
          instruction-tuned), which is how real lineages appear. Nothing is
          inferred beyond what authors publish.
        </p>
        <p className="mt-2 text-muted-foreground text-xs">
          Missing something?{" "}
          <Link href="/activity" className="underline underline-offset-4">
            The feed
          </Link>{" "}
          shows what the latest scrape picked up.
        </p>
      </section>
    </div>
  );
}
