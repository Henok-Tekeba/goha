import type { Project } from "@/features/projects/types/project.type";

import rawProjects from "./projects.mock.json";

type SerializedProject = Omit<Project, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export const projectsResponse: Project[] = (
  rawProjects as unknown as SerializedProject[]
).map((project) => ({
  ...project,
  repositoryDetails: {
    ...project.repositoryDetails,
    contributionFile: project.repositoryDetails.contributionFile ?? undefined,
    cocFile: project.repositoryDetails.cocFile ?? undefined,
  },
  createdAt: new Date(project.createdAt),
  updatedAt: new Date(project.updatedAt),
}));

/* eslint-disable @typescript-eslint/no-unused-vars */
function projectId(repoUrl: string): string {
  void repoUrl;
  return "";
}

/* PROJECT_IDS: semantic roles used by the mock DB (owner/claimable/bookmark demos).
   goha's fixture replaces the original catalog, so roles now map to fixture
   positions instead of specific upstream repoUrls. Regenerated data always
   provides >= 9 projects. */
const ROLE_INDEXES = {
  polar: 0,
  mistralCommon: 1,
  betterAuth: 2,
  hermesAgent: 3,
  steelBrowser: 4,
  react: 5,
  supabase: 6,
  svelte: 7,
  codex: 8,
} as const;

const roleProjectId = (index: number): string => {
  const project = projectsResponse[index];
  if (!project?.id)
    throw new Error(`Mock project fixture has no project at index ${index}`);
  return project.id;
};

export const PROJECT_IDS = Object.fromEntries(
  Object.entries(ROLE_INDEXES).map(([key, index]) => [
    key,
    roleProjectId(index),
  ])
) as Record<keyof typeof ROLE_INDEXES, string>;
