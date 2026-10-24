import type { ApiRequestContext } from "@/shared/lib/api-client";
import {
  emptyPaginated,
  filterProjects,
  paginate,
  paramsToSearchParams,
} from "@/shared/lib/project-filtering";
import type {
  PaginatedResponse,
  PaginationParams,
} from "@/shared/types/pagination.type";

import type { Project } from "../types/project.type";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validations/project.schema";

export interface ProjectQueryParams extends PaginationParams {
  published?: boolean;
  techStacks?: string | string[];
  categories?: string | string[];
  orderBy?: "createdAt" | "title" | "trending";
  orderDirection?: "asc" | "desc";
}

export interface UserProjectsQueryParams extends PaginationParams {
  published?: boolean;
}

export type UserBookmarksQueryParams = PaginationParams;

export type PaginatedProjectsResponse = PaginatedResponse<Project>;

/* goha: read-only static data (GitHub Pages architecture) */
const isServer = typeof window === "undefined";

async function loadAll(): Promise<Project[]> {
  if (isServer) {
    const { getAllProjects } = await import("@/shared/lib/local-data.server");
    return getAllProjects();
  }
  const { getAllProjects } = await import("@/shared/lib/local-data.client");
  return getAllProjects();
}

export async function getProjects(
  params?: ProjectQueryParams,
  _context: ApiRequestContext = {}
): Promise<PaginatedProjectsResponse> {
  const all = await loadAll();
  const sp = paramsToSearchParams(params as unknown as Record<string, unknown>);
  return paginate(
    filterProjects(sp, all),
    params?.page ?? 1,
    params?.per_page ?? 20
  );
}

export async function getProject(
  projectId: string,
  _context: ApiRequestContext = {}
): Promise<Project> {
  const all = await loadAll();
  const project = all.find((p) => p.id === projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);
  return project;
}

export async function getUserProjects(
  _userId: string,
  _params?: UserProjectsQueryParams,
  _context: ApiRequestContext = {}
): Promise<PaginatedProjectsResponse> {
  return emptyPaginated<Project>();
}

export async function getCurrentUserProjects(
  params?: UserProjectsQueryParams,
  context: ApiRequestContext = {}
): Promise<PaginatedProjectsResponse> {
  return getUserProjects("me", params, context);
}

export async function getCurrentUserBookmarks(
  _params?: UserBookmarksQueryParams,
  _context: ApiRequestContext = {}
): Promise<PaginatedProjectsResponse> {
  return emptyPaginated<Project>();
}

/* Write operations are not available on the read-only directory. */
const readOnly = (action: string): Promise<never> =>
  Promise.reject(
    new Error(`${action} is not available — goha is a read-only directory.`)
  );

export function createProject(_input: CreateProjectInput): Promise<Project> {
  return readOnly("Creating projects");
}

export function updateProject(
  _projectId: string,
  _input: UpdateProjectInput
): Promise<Project> {
  return readOnly("Updating projects");
}

export function deleteProject(_projectId: string): Promise<void> {
  return readOnly("Deleting projects");
}

export function uploadProjectLogo(
  _projectId: string,
  _file: File
): Promise<Project> {
  return readOnly("Uploading logos");
}

export function addProjectImage(
  _projectId: string,
  _file: File
): Promise<Project> {
  return readOnly("Uploading images");
}

export function deleteProjectImage(
  _projectId: string,
  _imageUrl: string
): Promise<Project> {
  return readOnly("Deleting images");
}

export function claimProject(_projectId: string): Promise<Project> {
  return readOnly("Claiming projects");
}

export function addProjectBookmark(_projectId: string): Promise<Project> {
  return readOnly("Bookmarks");
}

export function deleteProjectBookmark(_projectId: string): Promise<void> {
  return readOnly("Bookmarks");
}
