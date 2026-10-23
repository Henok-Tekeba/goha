import type { Project } from "@/features/projects/types/project.type";
import type { ApiRequestContext } from "@/shared/lib/api-client";

export interface RepositoryDetailsResponse {
  forksCount: number;
  openIssuesCount: number;
  stars: number;
  languages: { [language: string]: number };
  created_at?: string | null;
  updated_at?: string | null;
  pushed_at?: string | null;
}

export async function getProjectRepositorySummary(
  projectId: string,
  _context: ApiRequestContext = {}
): Promise<RepositoryDetailsResponse> {
  const isServer = typeof window === "undefined";
  const loader = isServer
    ? import("@/shared/lib/local-data.server")
    : import("@/shared/lib/local-data.client");
  const { getAllProjects } = await loader;
  const all = await getAllProjects();
  const project = all.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);

  const raw = Array.isArray(project.repositoryDetails?.languages)
    ? (project.repositoryDetails?.languages as unknown as string[])
    : [];
  const languages: { [language: string]: number } = {};
  for (const lang of raw) languages[lang] = 100;

  return {
    forksCount: project.repositoryDetails?.forksCount ?? 0,
    openIssuesCount: project.repositoryDetails?.openIssuesCount ?? 0,
    stars: project.repositoryDetails?.stars ?? 0,
    languages,
  };
}

export type { Project };
