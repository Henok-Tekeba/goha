"use client";

import EcosystemDonutChart from "@/features/ecosystem/components/charts/ecosystem-donut-chart";

import OrgsGrid from "../components/orgs-grid.component";

export default function OrgsView() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Organizations
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Everyone building Ethiopian AI — companies, labs and independent
          researchers — with their full public footprint across Hugging Face and
          GitHub in one profile.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 rounded-[20px] border border-muted-black-stroke px-4 py-5 md:flex-row md:items-center md:gap-10">
          <EcosystemDonutChart className="h-52 w-full max-w-[280px]" />
          <div className="max-w-sm text-center md:text-left">
            <p className="mb-1 font-medium text-black/40 text-xs uppercase tracking-wide">
              What&apos;s in the index
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              The index spans five asset types. Models and datasets dominate —
              research papers close the distance between code and knowledge.
              Every sector links back to its source.
            </p>
          </div>
        </div>
      </header>
      <OrgsGrid />
    </div>
  );
}
