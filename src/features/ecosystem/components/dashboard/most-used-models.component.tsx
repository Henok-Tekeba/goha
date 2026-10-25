import Link from "next/link";

import ProjectGrid from "@/features/projects/components/project-grid.component";
import type { Project } from "@/features/projects/types/project.type";

export default function MostUsedModels({
  models,
  totalModels,
}: {
  models: Project[];
  totalModels: number;
}) {
  return (
    <section aria-labelledby="most-used-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="most-used-heading"
          className="text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Most used models
        </h2>
        <Link
          href="/?categories=Model"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          Browse all{totalModels ? ` ${totalModels}` : ""} models →
        </Link>
      </div>

      <ProjectGrid
        projects={models}
        className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3"
      />
    </section>
  );
}
