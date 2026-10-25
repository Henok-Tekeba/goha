import type { Metadata } from "next";
import type { AskData, AskProject } from "@/features/ecosystem/lib/ask-answer";
import {
  getPublicLanguageCoverage,
  getPublicLeaderboard,
  getPublicPapers,
} from "@/features/ecosystem/lib/public-data.server";
import AskView from "@/features/ecosystem/views/ask.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { orgs, projects } from "@/shared/lib/local-data.server";

export const metadata: Metadata = {
  title: "Ask — natural-language search for Ethiopian AI",
  description:
    "Ask about Ethiopian AI in plain language: models, datasets, papers, organizations, gaps and benchmarks — answered from the index, with sources.",
  alternates: { canonical: "/ask" },
};

function askProjects(): AskProject[] {
  return projects
    .filter((project) =>
      project.projectCategories?.some((category) =>
        ["Model", "Dataset", "Research"].includes(category.name)
      )
    )
    .map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      owner: project.owner ? { name: project.owner.name } : null,
      downloadsMonthly: project.downloadsMonthly ?? 0,
      paramCount: project.paramCount ?? null,
      evaluations: project.evaluations ?? [],
      projectCategories: (project.projectCategories ?? []).map((category) => ({
        name: category.name,
      })),
      projectTechStacks: (project.projectTechStacks ?? []).map((stack) => ({
        name: stack.name,
        type: stack.type,
      })),
      repositoryDetails: {
        languages: project.repositoryDetails?.languages ?? [],
        license: project.repositoryDetails?.license ?? null,
      },
      updatedAt: new Date(project.updatedAt).toISOString(),
    }));
}

const askData: AskData = {
  projects: askProjects(),
  papers: getPublicPapers(),
  orgs,
  leaderboard: getPublicLeaderboard(),
  coverage: getPublicLanguageCoverage(),
};

export default function AskPage() {
  return (
    <>
      <main>
        <AskView data={askData} />
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
