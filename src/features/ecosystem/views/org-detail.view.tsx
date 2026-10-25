"use client";

import Link from "next/link";
import { HiArrowTopRightOnSquare, HiMiniCheckBadge } from "react-icons/hi2";

import OrgRadarChart from "@/features/ecosystem/components/charts/org-radar-chart";
import type { OrgRadarAxis } from "@/features/ecosystem/types/ecosystem.types";
import ProjectGrid from "@/features/projects/components/project-grid.component";
import type { Project } from "@/features/projects/types/project.type";
import ShareButton from "@/shared/components/share/share-button.component";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

import type { OrgRecord } from "../types/ecosystem.types";

interface OrgDetailViewProps {
  org: OrgRecord;
  projects: Project[];
  axes: OrgRadarAxis[];
}

function ExternalRow({
  name,
  desc,
  meta,
  url,
}: {
  name: string;
  desc?: string | null;
  meta?: string | null;
  url: string | null;
}) {
  if (!url) return null;
  return (
    <li className="border-muted-black-stroke border-b last:border-b-0">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 px-5 py-3.5 hover:bg-secondary/60"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary text-sm tracking-tight">
            {name}
          </p>
          {desc && (
            <p className="mt-0.5 line-clamp-1 text-muted-foreground text-xs">
              {desc}
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-2 pt-0.5">
          {meta && (
            <span className="text-muted-foreground text-xs tabular-nums">
              {meta}
            </span>
          )}
          <HiArrowTopRightOnSquare className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
        </span>
      </a>
    </li>
  );
}

function StatBox({
  value,
  singular,
  plural,
}: {
  value: number;
  singular: string;
  plural: string;
}) {
  return (
    <div className="min-w-[72px] rounded-[12px] border border-muted-black-stroke px-3 py-2.5 text-center">
      <p className="font-medium text-primary text-sm tabular-nums">
        {value.toLocaleString("en")}
      </p>
      <p className="text-[11px] text-muted-foreground">
        {value === 1 ? singular : plural}
      </p>
    </div>
  );
}

const kindLabel: Record<OrgRecord["kind"], string> = {
  company: "Company",
  lab: "Lab",
  individual: "Publisher",
};

export default function OrgDetailView({
  org,
  projects,
  axes,
}: OrgDetailViewProps) {
  const models = projects.filter((p) =>
    p.projectCategories?.some((c) => c.name === "Model")
  );
  const datasets = projects.filter((p) =>
    p.projectCategories?.some((c) => c.name === "Dataset")
  );
  const hasModels = models.length > 0;
  const hasDatasets = datasets.length > 0;
  const firstTab = hasModels ? "models" : hasDatasets ? "datasets" : "links";

  return (
    <div className="mx-auto max-w-5xl px-6">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex size-14 items-center justify-center rounded-[16px] bg-secondary font-semibold text-lg text-primary"
            aria-hidden
          >
            {org.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-2xl text-primary tracking-[-0.03em] md:text-3xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                {org.name}
              </h1>
              {org.verified && (
                <HiMiniCheckBadge
                  className="size-5 text-ost-blue-three"
                  title="Verified organization (curated in goha)"
                />
              )}
            </div>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {kindLabel[org.kind]}
              {org.founded ? ` · founded ${org.founded}` : ""} · part of the
              Ethiopian AI ecosystem
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ShareButton
              path={`/orgs/${org.slug}`}
              title={org.name}
              text={
                org.desc ??
                `${org.name} — an organization in the Ethiopian AI ecosystem.`
              }
            />
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary px-4 py-2 text-primary-foreground text-xs"
              >
                Website ↗
              </a>
            )}
            {org.hfOrg && (
              <a
                href={org.hfOrg}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-muted-black-stroke px-4 py-2 text-primary text-xs"
              >
                Hugging Face ↗
              </a>
            )}
            {org.github && (
              <a
                href={org.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-muted-black-stroke px-4 py-2 text-primary text-xs"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </div>

        {org.desc && (
          <p className="mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed">
            {org.desc}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_auto]">
          <div className="flex flex-wrap gap-2">
            <StatBox
              value={org.counts.models}
              singular="model"
              plural="models"
            />
            <StatBox
              value={org.counts.datasets}
              singular="dataset"
              plural="datasets"
            />
            <StatBox value={org.counts.repos} singular="repo" plural="repos" />
            <StatBox
              value={org.counts.spaces}
              singular="space"
              plural="spaces"
            />
            {org.downloadsMonthly > 0 && (
              <StatBox
                value={org.downloadsMonthly}
                singular="download/mo"
                plural="downloads/mo"
              />
            )}
          </div>
          <div className="flex items-center gap-4">
            <OrgRadarChart
              axes={axes}
              className="h-44 w-44 shrink-0 md:h-48 md:w-48"
            />
            <p className="hidden max-w-[220px] text-muted-foreground text-xs leading-relaxed md:block">
              Footprint shape — each axis normalized against the ecosystem-wide
              maximum. A fuller polygon means this org publishes across every
              channel.
            </p>
          </div>
        </div>

        {org.langs.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {org.langs.map((lang) => (
              <Link
                key={lang}
                href={`/?techStacks=${encodeURIComponent(lang)}`}
                className="rounded-full border border-muted-black-stroke bg-white px-2.5 py-1 text-muted-foreground text-xs transition-colors hover:text-primary"
              >
                {lang}
              </Link>
            ))}
          </div>
        )}
      </header>

      <Tabs defaultValue={firstTab}>
        <TabsList>
          {hasModels && (
            <TabsTrigger value="models" count={models.length}>
              Models
            </TabsTrigger>
          )}
          {hasDatasets && (
            <TabsTrigger value="datasets" count={datasets.length}>
              Datasets
            </TabsTrigger>
          )}
          {org.topRepos.length > 0 && (
            <TabsTrigger value="repos" count={org.counts.repos}>
              Repos
            </TabsTrigger>
          )}
          {org.topSpaces.length > 0 && (
            <TabsTrigger value="spaces" count={org.counts.spaces}>
              Spaces
            </TabsTrigger>
          )}
        </TabsList>

        {hasModels && (
          <TabsContent value="models" className="mt-6">
            <ProjectGrid projects={models} />
          </TabsContent>
        )}
        {hasDatasets && (
          <TabsContent value="datasets" className="mt-6">
            <ProjectGrid projects={datasets} />
          </TabsContent>
        )}
        {org.topRepos.length > 0 && (
          <TabsContent value="repos" className="mt-6">
            <ul className="rounded-[16px] border border-muted-black-stroke">
              {org.topRepos.map((repo) => (
                <ExternalRow
                  key={repo.name}
                  name={repo.name.split("/").slice(1).join("/") || repo.name}
                  desc={repo.desc}
                  meta={
                    repo.stars > 0 ? `★ ${formatNumberShort(repo.stars)}` : null
                  }
                  url={repo.url}
                />
              ))}
            </ul>
          </TabsContent>
        )}
        {org.topSpaces.length > 0 && (
          <TabsContent value="spaces" className="mt-6">
            <ul className="rounded-[16px] border border-muted-black-stroke">
              {org.topSpaces.map((space) => (
                <ExternalRow
                  key={space.name}
                  name={space.name}
                  meta={
                    space.likes > 0
                      ? `♥ ${formatNumberShort(space.likes)}`
                      : null
                  }
                  url={space.url}
                />
              ))}
            </ul>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
