/**
 * Server/build-context access to goha.et's committed data.
 * The bundler inlines the JSON — never imported by client code.
 */

import type { Project } from "@/features/projects/types/project.type";
import rawProjects from "@/mocks/fixtures/projects.mock.json";
import { categories, techStacks } from "@/mocks/fixtures/taxonomy.mock";

export const projects = rawProjects as unknown as Project[];
export { categories, techStacks };

export async function getAllProjects(): Promise<Project[]> {
  return projects;
}

export async function getTaxonomyData() {
  return { categories, techStacks };
}
