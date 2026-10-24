import ProjectCard from "@/shared/components/shared/ProjectCard";

import { useProjectRepositorySummary } from "../../../shared/hooks/use-git-repo-summary.hook";
import type { Project } from "../types/project.type";

interface ProjectGridProps {
  projects: Project[];
  className?: string;
}

function ProjectGridItem({ project }: { project: Project }) {
  const { data: repoSummary, isLoading: isRepoLoading } =
    useProjectRepositorySummary(project.id);

  const repositoryDetails = {
    languages:
      repoSummary?.languages ?? project.repositoryDetails?.languages ?? {},
    forksCount:
      repoSummary?.forksCount ?? project.repositoryDetails?.forksCount ?? 0,
    stars: repoSummary?.stars ?? project.repositoryDetails?.stars ?? 0,
    openIssuesCount:
      repoSummary?.openIssuesCount ??
      project.repositoryDetails?.openIssuesCount ??
      0,
  };

  return (
    <ProjectCard
      key={project.id}
      projectId={project.id}
      title={project.title}
      description={project.description}
      repoUrl={project.repoUrl || ""}
      ownerName={project.owner?.name ?? null}
      kindLabel={project.projectCategories?.[0]?.name ?? null}
      taskLabel={
        project.projectCategories && project.projectCategories.length > 1
          ? (project.projectCategories[1]?.name ?? null)
          : null
      }
      downloadsMonthly={project.downloadsMonthly}
      growth={project.growth}
      sparkline={project.sparkline}
      repositoryDetails={repositoryDetails}
      isRepositoryLoading={isRepoLoading}
    />
  );
}

export default function ProjectGrid({ projects, className }: ProjectGridProps) {
  return (
    <div
      className={
        className ?? "grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6.5"
      }
    >
      {projects?.map((project) => (
        <ProjectGridItem key={project.id} project={project} />
      ))}
    </div>
  );
}
