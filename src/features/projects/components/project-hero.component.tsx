import Link from "next/link";

import ShareButton from "@/shared/components/share/share-button.component";
import { Button } from "@/shared/components/ui/button";
import { ProjectTypeIcon } from "@/shared/components/ui/project-type-icon";

import type { Project } from "../types/project.type";
import { BookmarkButton } from "./bookmark-button.component";

interface ProjectHeroProps {
  project: Project;
  hideHeader?: boolean;
}

function sourceLabel(project: Project): string {
  const isResearch = project.projectCategories?.some(
    (category) => category.name === "Research"
  );
  return isResearch ? "View Paper" : "View Repository";
}

export function ProjectMobileHero({ project }: ProjectHeroProps) {
  const {
    id = "",
    title = "",
    description = "",
    repoUrl = "",
    projectCategories = [],
  } = project;
  const kindLabel = projectCategories[0]?.name ?? null;
  const taskLabel = projectCategories[1]?.name ?? null;

  return (
    <div className="flex flex-col bg-white">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-muted-black-stroke text-primary">
          <ProjectTypeIcon
            kindLabel={kindLabel}
            taskLabel={taskLabel}
            className="size-6"
          />
        </span>
        <h1 className="flex-1 truncate text-start font-medium text-xl">
          {title}
        </h1>
      </div>

      <p className="mt-4 mb-8 line-clamp-5 break-words font-normal text-sm tracking-normal">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <ShareButton
          path={`/projects/${id}`}
          title={title}
          text={description}
        />
        <BookmarkButton projectId={id} />
        {repoUrl ? (
          <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
            <Button>{sourceLabel(project)}</Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function ProjectHero({
  project,
  hideHeader = false,
}: ProjectHeroProps) {
  const {
    id = "",
    title = "",
    description = "",
    repoUrl = "",
    projectCategories = [],
  } = project;
  const kindLabel = projectCategories[0]?.name ?? null;
  const taskLabel = projectCategories[1]?.name ?? null;

  return (
    <div className="flex flex-col bg-white">
      {!hideHeader && (
        <div>
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-muted-black-stroke text-primary">
                <ProjectTypeIcon
                  kindLabel={kindLabel}
                  taskLabel={taskLabel}
                  className="size-8"
                />
              </span>
              <h1 className="max-w-[70vw] truncate text-start font-medium text-2xl sm:max-w-[45vw] sm:text-2xl">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <ShareButton
                path={`/projects/${id}`}
                title={title}
                text={description}
              />
              <BookmarkButton projectId={id} />
              {repoUrl ? (
                <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <Button>{sourceLabel(project)}</Button>
                </Link>
              ) : null}
            </div>
          </div>

          <p className="mt-4 line-clamp-6 break-words text-sm tracking-normal">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
