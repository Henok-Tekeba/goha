"use client";

import { HiMiniExclamationTriangle } from "react-icons/hi2";

import TwoColumnLayout from "@/shared/components/layout/two-column-layout.component";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ErrorState } from "@/shared/components/ui/error-state";
import ImageSlider from "@/shared/components/ui/image-slider.component";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useTabNavigation } from "@/shared/hooks/use-tab-navigation.hook";

import ProjectHero, {
  ProjectMobileHero,
} from "../components/project-hero.component";
import ProjectReadme from "../components/project-readme.component";
import ProjectSideBar from "../components/project-side-bar.component";
import SkeletonProjectDetail from "../components/skeletons/skeleton-project-detail.component";
import { projectKeys } from "../hooks/project.keys";
import { useProjectQuery } from "../hooks/project.queries";
import { useDecodedFiles } from "../hooks/use-decoded-files.hook";

interface ProjectDetailViewProps {
  projectId: string;
}

export default function ProjectDetailView({
  projectId,
}: ProjectDetailViewProps) {
  const { data: project, isLoading, isError } = useProjectQuery(projectId);
  const { tab, handleTabChange } = useTabNavigation("overview");
  const { readme } = useDecodedFiles(project);

  if (!project && isLoading) {
    return <SkeletonProjectDetail />;
  }

  if (!project && isError) {
    return (
      <ErrorState
        message="An error has occurred while loading the project. Please try again later."
        queryKey={projectKeys.detail(projectId)}
        className="mt-20 mb-28"
        buttonText="Back to homepage"
        href="/projects"
      />
    );
  }

  if (!project) return null;

  const languages: string[] = Array.isArray(
    project.repositoryDetails?.languages
  )
    ? (project.repositoryDetails?.languages as string[])
    : [];
  const evaluations = project.evaluations ?? [];
  const langSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <TwoColumnLayout
      sidebar={<ProjectSideBar project={project} />}
      hero={<ProjectHero project={project} />}
      mobileHeader={<ProjectMobileHero project={project} />}
    >
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {evaluations.length > 0 && (
            <TabsTrigger value="evaluations" count={evaluations.length}>
              Evaluations
            </TabsTrigger>
          )}
          {languages.length > 0 && (
            <TabsTrigger value="languages" count={languages.length}>
              Languages
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {(() => {
            if (project.imagesUrls.length === 0 && !readme) {
              return (
                <EmptyState
                  title="No data available"
                  description="This project has no overview data available."
                  icon={HiMiniExclamationTriangle}
                />
              );
            }

            return (
              <>
                {project.imagesUrls.length > 0 && (
                  <ImageSlider
                    images={project.imagesUrls}
                    updatedAt={project.updatedAt}
                  />
                )}
                {readme && (
                  <ProjectReadme
                    readme={readme}
                    projectTitle={project.title}
                    project={{
                      repoUrl: project.repoUrl,
                    }}
                  />
                )}
              </>
            );
          })()}
        </TabsContent>

        {evaluations.length > 0 && (
          <TabsContent value="evaluations" className="mt-6">
            <div className="flex flex-col gap-6">
              {evaluations.map((entry, i) => (
                <div
                  key={i}
                  className="rounded-[12px] border border-muted-black-stroke px-5 pt-4 pb-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-medium text-primary text-sm tracking-tight">
                      {entry.task?.name || entry.task?.type || "Evaluation"}
                    </h3>
                    <span className="text-muted-foreground text-xs">
                      {entry.dataset?.name || ""}
                    </span>
                  </div>
                  <table className="mt-3 w-full text-sm">
                    <tbody>
                      {(entry.metrics ?? []).map((m, j) => (
                        <tr
                          key={j}
                          className="border-black/5 border-b last:border-b-0"
                        >
                          <td className="py-2 pr-4 text-muted-foreground">
                            {m.name || m.type || "Metric"}
                          </td>
                          <td className="py-2 text-right font-medium text-primary tabular-nums">
                            {typeof m.value === "number" &&
                            m.value < 1 &&
                            /wer|cer|error/i.test(m.name || m.type || "")
                              ? `${(m.value * 100).toFixed(2)}%`
                              : String(m.value ?? "")}
                            {m.verified ? (
                              <span
                                className="ml-1.5 text-black/40"
                                title="Verified metric"
                              >
                                ✓
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {languages.length > 0 && (
          <TabsContent value="languages" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {languages.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-2 rounded-full border border-muted-black-stroke bg-white py-1 pr-3 pl-1 text-primary text-sm tracking-tight"
                >
                  <img
                    src={`/langs/${langSlug(name)}.svg`}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-md"
                  />
                  {name}
                </span>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </TwoColumnLayout>
  );
}
