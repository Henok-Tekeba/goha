import Link from "next/link";
import { useMemo } from "react";
import { FaDownload, FaStar } from "react-icons/fa6";
import type { RepositoryWithDetails } from "@/features/projects/types/project.type";
import {
  ProjectCard,
  ProjectCardContent,
  ProjectCardDescription,
  ProjectCardDivider,
  ProjectCardFooter,
  ProjectCardHeader,
  ProjectCardInfo,
  ProjectCardLeftGroup,
  ProjectCardTechStack,
  ProjectCardTitle,
} from "@/shared/components/ui/project-card";
import { languagesToTechStacks } from "@/shared/lib/language-icons";
import { extractRepositoryOwner } from "@/shared/lib/utils/extract-repo-owner";
import { formatNumberShort } from "@/shared/lib/utils/format-number";
import type { TechStackType } from "@/shared/types/tech-stack.type";

import { Avatar } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import StackLogo from "../ui/stack-logo";

interface ProjectCardProps {
  projectId?: string;
  title: string;
  description: string;
  projectTechStacks?: TechStackType[];
  showTechStack?: boolean;
  repoUrl?: string;
  className?: string;
  logoUrl?: string;
  downloadsMonthly?: number;
  growth?: number | null;
  sparkline?: { points: number[] } | null;
  repositoryDetails?: Pick<
    RepositoryWithDetails,
    "stars" | "forksCount" | "openIssuesCount" | "languages"
  >;
  isRepositoryLoading?: boolean;
}

/* Mini trend graph — real daily-download history from goha's snapshots */
function CardSparkline({
  points,
  growth,
}: {
  points: number[];
  growth?: number | null;
}) {
  if (!points || points.length < 2) return null;
  const w = 46;
  const h = 16;
  const pad = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const d = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - ((p - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const up = growth == null || growth >= 0;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      className={up ? "text-emerald-500" : "text-red-500"}
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectCardComponent({
  projectId,
  title = "",
  description = "",
  repoUrl = "",
  projectTechStacks = [],
  showTechStack = true,
  className = "",
  logoUrl = "",
  downloadsMonthly = 0,
  growth = null,
  sparkline = null,

  repositoryDetails = {
    forksCount: 0,
    stars: 0,
    openIssuesCount: 0,
    languages: {},
  },
  isRepositoryLoading = false,
}: ProjectCardProps) {
  const languagesTechStacks = useMemo(() => {
    return languagesToTechStacks(repositoryDetails.languages);
  }, [repositoryDetails.languages]);

  const allTechStacks = useMemo(() => {
    const stacks =
      projectTechStacks.length > 0 ? projectTechStacks : languagesTechStacks;

    return stacks.filter((tech): tech is TechStackType => Boolean(tech));
  }, [projectTechStacks, languagesTechStacks]);

  return (
    <Link href={`/projects/${projectId}`} className="block">
      <ProjectCard className={className}>
        <ProjectCardHeader>
          <ProjectCardLeftGroup>
            <Avatar
              src={logoUrl}
              name={title}
              alt={title}
              size="lg"
              shape="soft"
            />
            <ProjectCardInfo>
              <ProjectCardTitle className="text-primary">
                {title}
              </ProjectCardTitle>
              <p className="-mt-1 text-muted-foreground text-sm tracking-tighter">
                by {extractRepositoryOwner(repoUrl)}
              </p>
            </ProjectCardInfo>
          </ProjectCardLeftGroup>
        </ProjectCardHeader>
        <ProjectCardContent>
          <ProjectCardDescription>{description}</ProjectCardDescription>
          <ProjectCardDivider />
          {showTechStack && (
            <ProjectCardFooter>
              <div className="flex gap-2.5">
                {allTechStacks.length > 0
                  ? allTechStacks.slice(0, 3).map((tech, index) => (
                      <span
                        key={tech.id || index}
                        className={
                          index === 0
                            ? "inline-flex"
                            : index === 1
                              ? "hidden md:inline-flex"
                              : "hidden md:inline-flex"
                        }
                      >
                        <StackLogo
                          icon={tech.iconUrl || ""}
                          alt={tech.name}
                          name={tech.name}
                        />
                      </span>
                    ))
                  : isRepositoryLoading
                    ? Array.from({ length: 3 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={
                            idx === 0
                              ? "flex items-center gap-1.5"
                              : "hidden items-center gap-1.5 md:flex"
                          }
                        >
                          <Skeleton className="size-5.5 rounded-full" />
                          <Skeleton className="h-5.5 w-16 rounded-md" />
                        </div>
                      ))
                    : null}
              </div>
              {/* Mobile +N when > 1 */}
              {allTechStacks.length > 1 && (
                <span className="ml-1 flex h-5.5 flex-shrink-0 items-center whitespace-nowrap rounded-full bg-transparent text-black/20 text-xs md:hidden">
                  +{allTechStacks.length - 1}
                </span>
              )}
              {/* Desktop +N when > 3 */}
              {allTechStacks.length > 3 && (
                <span className="ml-3 hidden h-5.5 flex-shrink-0 items-center whitespace-nowrap rounded-full bg-transparent text-black/20 text-xs md:flex">
                  +{allTechStacks.length - 3}
                </span>
              )}

              <div className="ml-auto flex items-center justify-between space-x-2">
                {sparkline &&
                  sparkline.points &&
                  sparkline.points.length > 1 && (
                    <span className="mr-1 hidden sm:inline-flex">
                      <CardSparkline
                        points={sparkline.points}
                        growth={growth}
                      />
                    </span>
                  )}
                <div className="flex items-center justify-center gap-1 rounded-[3px] border border-[black]/10 px-1.5 py-px text-xs">
                  <FaDownload className="mr-0.5 size-2.5 text-black/50" />
                  {isRepositoryLoading ? (
                    <Skeleton className="h-3 w-6" />
                  ) : (
                    formatNumberShort(downloadsMonthly || 0)
                  )}
                </div>
                <div className="flex items-center justify-center gap-0.5 rounded-[3px] border border-[black]/10 px-1.5 py-px text-xs">
                  <FaStar className="mr-0.5 size-2.5 text-primary" />
                  {isRepositoryLoading ? (
                    <Skeleton className="h-3 w-6" />
                  ) : (
                    formatNumberShort(repositoryDetails.stars || 0)
                  )}
                </div>
              </div>
            </ProjectCardFooter>
          )}
        </ProjectCardContent>
      </ProjectCard>
    </Link>
  );
}
