import type { Metadata } from "next";
import CompareView, {
  type CompareModel,
} from "@/features/ecosystem/views/compare.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { projects } from "@/shared/lib/local-data.server";
import { pageMetadata } from "@/shared/lib/page-metadata";

export const metadata: Metadata = pageMetadata({
  title: "Compare Ethiopian AI models",
  description:
    "Put Ethiopian models side by side: download trajectories, task, languages, license, size and lineage.",
  path: "/compare",
});

function compareModels(): CompareModel[] {
  return projects
    .filter((project) =>
      project.projectCategories?.some((category) => category.name === "Model")
    )
    .map((project) => ({
      id: String(project.id),
      title: project.title,
      owner: project.owner ? { name: project.owner.name } : null,
      downloadsMonthly: project.downloadsMonthly ?? 0,
      sparkline: project.sparkline ?? null,
      projectCategories: (project.projectCategories ?? []).map((category) => ({
        name: category.name,
      })),
      paramCount: project.paramCount ?? null,
      baseModel: project.baseModel ?? null,
      repositoryDetails: {
        languages: project.repositoryDetails?.languages ?? [],
        license: project.repositoryDetails?.license ?? null,
        stars: project.repositoryDetails?.stars ?? 0,
      },
      createdAt: new Date(project.createdAt).toISOString(),
      updatedAt: new Date(project.updatedAt).toISOString(),
    }));
}

export default function ComparePage() {
  const models = compareModels();
  return (
    <>
      <main>
        <CompareView models={models} />
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
