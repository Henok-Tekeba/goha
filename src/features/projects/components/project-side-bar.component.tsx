"use client";

import { useMemo } from "react";
import {
  HiArrowDownTray,
  HiMiniCalendarDays,
  HiMiniClock,
  HiStar,
} from "react-icons/hi2";
import { LiaBalanceScaleSolid } from "react-icons/lia";
import { ContributorsSidebarList } from "@/features/projects/components/contributors-sidebar-list.component";
import { CategoryList } from "@/shared/components/ui/category-list";
import { ExternalLinks } from "@/shared/components/ui/external-link";
import { StatsList } from "@/shared/components/ui/stats-list";
import { TechStackList } from "@/shared/components/ui/tech-stack-list";
import { languagesToTechStacks } from "@/shared/lib/language-icons";
import { formatNumberShort } from "@/shared/lib/utils/format-number";
import { formatTimeAgo } from "@/shared/lib/utils/format-time-ago";

import type { Project } from "../types/project.type";

interface ProjectSideBarProps {
  project: Project;
}

/* goha.et — download history from the daily snapshots pipeline */
function DownloadHistory({ project }: { project: Project }) {
  const points = project.sparkline?.points ?? [];
  if (points.length < 2) return null;

  const w = 232;
  const h = 56;
  const pad = 4;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const line = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - ((p - min) / range) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${line} L${(pad + (points.length - 1) * step).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  const timestamps = project.sparkline?.timestamps ?? [];
  const first = timestamps[0] ? String(timestamps[0]).slice(5) : "";
  const last = timestamps[timestamps.length - 1]
    ? String(timestamps[timestamps.length - 1]).slice(5)
    : "";

  return (
    <div className="rounded-[12px] border border-muted-black-stroke px-4 pt-4 pb-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium text-primary text-sm tracking-tight">
          Download history
        </h3>
        <span className="text-muted-foreground text-xs">
          {formatNumberShort(points[points.length - 1] ?? 0)} /day
        </span>
      </div>
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="mt-3"
      >
        <path d={area} fill="currentColor" className="text-black/4" />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>
      {(first || last) && (
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{first}</span>
          <span>{last}</span>
        </div>
      )}
    </div>
  );
}

export default function ProjectSideBar({ project }: ProjectSideBarProps) {
  const {
    projectTechStacks = [],
    projectCategories = [],
    repositoryDetails = {
      stars: null,
      forksCount: null,
      contributors: [],
      pushed_at: null,
      tags: [],
      languages: {},
      license: null,
    },
  } = project;

  const contributors = project.repositoryDetails?.contributors || [];

  const allContributors = (() => {
    if (!contributors || contributors.length === 0) return [];
    return contributors;
  })();

  const handleContributorClick = (contributor: { login?: string }) => {
    if (contributor.login) {
      const url = `https://github.com/${contributor.login}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const languagesTechStacks = useMemo(() => {
    const converted = languagesToTechStacks(repositoryDetails?.languages || {});
    return converted;
  }, [repositoryDetails?.languages]);

  const allTechStacks = useMemo(() => {
    if (projectTechStacks.length > 0) {
      return projectTechStacks;
    }
    return languagesTechStacks;
  }, [projectTechStacks, languagesTechStacks]);

  const tagsCategories = useMemo(() => {
    return (
      repositoryDetails?.tags?.map((tag) => ({
        name: tag,
      })) || []
    );
  }, [repositoryDetails?.tags]);

  const allCategories = useMemo(() => {
    if (projectCategories.length > 0) {
      return projectCategories;
    }
    return tagsCategories;
  }, [projectCategories, tagsCategories]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <StatsList
        title="Statistics"
        items={[
          {
            icon: HiArrowDownTray,
            label: "Downloads",
            value: `${formatNumberShort(project.downloadsMonthly ?? 0)}/mo`,
          },
          {
            icon: HiStar,
            label: "Likes",
            value: formatNumberShort(repositoryDetails?.stars ?? 0),
          },
          {
            icon: HiMiniCalendarDays,
            label: "First indexed",
            value: project.createdAt
              ? new Date(project.createdAt).toLocaleDateString("en", {
                  month: "short",
                  year: "numeric",
                })
              : "N/A",
          },
          {
            icon: HiMiniClock,
            label: "Last updated",
            value: project.updatedAt
              ? formatTimeAgo(new Date(project.updatedAt).toISOString())
              : "N/A",
          },
        ]}
      />

      <DownloadHistory project={project} />

      <TechStackList
        title="Technical Stack"
        techs={allTechStacks}
        emptyText="No technologies added"
      />

      <CategoryList
        title={projectCategories.length > 0 ? "Categories" : "Tags"}
        categories={allCategories}
        emptyText="No tags added"
      />

      <ContributorsSidebarList
        title="Contributors"
        contributors={allContributors}
        onClickContributor={handleContributorClick}
        emptyText="No contributors yet"
      />

      {repositoryDetails?.license && repositoryDetails?.license !== "Other" && (
        <div className="mb-2 flex flex-col">
          <h2 className="mb-3 text-sm">License</h2>
          <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <LiaBalanceScaleSolid className="size-5" />
            {repositoryDetails?.license}
          </p>
        </div>
      )}

      <ExternalLinks
        title="External Links"
        source={project}
        emptyText="No links added"
      />
    </div>
  );
}
