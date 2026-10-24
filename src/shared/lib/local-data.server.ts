/**
 * Server/build-context access to goha.et's committed data.
 * The bundler inlines the JSON — never imported by client code.
 */

import type {
  OrgRecord,
  PaperRecord,
} from "@/features/ecosystem/types/ecosystem.types";
import type { Project } from "@/features/projects/types/project.type";
import rawLanguages from "@/mocks/fixtures/languages.mock.json";
import rawOrgs from "@/mocks/fixtures/orgs.mock.json";
import rawPapers from "@/mocks/fixtures/papers.mock.json";
import rawProjects from "@/mocks/fixtures/projects.mock.json";
import {
  categories,
  techStacks as rawStacks,
} from "@/mocks/fixtures/taxonomy.mock";

import { asset } from "@/shared/lib/asset";

/* Baking the base path into data-driven asset URLs (logoUrl, iconUrl)
   means consumers need no changes at all. */
export const projects: Project[] = (rawProjects as unknown as Project[]).map(
  (p) => ({
    ...p,
    logoUrl: p.logoUrl ? asset(p.logoUrl) : p.logoUrl,
    projectTechStacks: (p.projectTechStacks ?? []).map((t) => ({
      ...t,
      iconUrl: t.iconUrl ? asset(t.iconUrl) : t.iconUrl,
    })),
  })
);
export const techStacks = rawStacks.map((t) => ({
  ...t,
  iconUrl: t.iconUrl ? asset(t.iconUrl) : t.iconUrl,
}));
export { categories };

export async function getAllProjects(): Promise<Project[]> {
  return projects;
}

export async function getTaxonomyData() {
  return { categories, techStacks };
}

/* ---------------- ecosystem surfaces (build-time) ---------------- */

export const orgs: OrgRecord[] = rawOrgs as unknown as OrgRecord[];

export function getOrgBySlug(slug: string): OrgRecord | undefined {
  return orgs.find((org) => org.slug === slug);
}

const normOrg = (s: string) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** All goha projects (models, datasets, companies) published under an org. */
export function getOrgProjects(org: OrgRecord): Project[] {
  const keys = new Set(
    [org.key, org.name, org.hfOrg?.split("/").pop() ?? ""]
      .map(normOrg)
      .filter(Boolean)
  );
  return projects.filter((project) => {
    if (project.owner?.name && keys.has(normOrg(project.owner.name)))
      return true;
    /* topModels carry explicit project ids regardless of naming drift */
    return org.topModels.some((model) => model.projectId === project.id);
  });
}

/* ---------------- language pages (build-time joins + gap analysis) ---------------- */

export const languages: { name: string; slug: string; glyph: string }[] =
  rawLanguages as { name: string; slug: string; glyph: string }[];

const papersList: PaperRecord[] = rawPapers as unknown as PaperRecord[];

function paperTaskOf(paper: PaperRecord): string | null {
  if (paper.tasks.includes("ASR")) return "ASR";
  if (paper.tasks.includes("TTS")) return "TTS";
  if (paper.tasks.includes("Translation")) return "Translation";
  if (paper.tasks.includes("LLM")) return "LLM";
  if (paper.tasks.includes("NER")) return "NER";
  if (paper.tasks.includes("Embeddings")) return "Embeddings";
  if (paper.tasks.includes("Benchmark")) return "Benchmarks";
  return null;
}

function modelTaskOf(project: Project): string | null {
  const names = (project.projectCategories ?? []).map((c) => c.name);
  if (names.includes("ASR")) return "ASR";
  if (names.includes("Translation")) return "Translation";
  if (names.includes("LLM")) return "LLM";
  if (names.includes("NER")) return "NER";
  if (names.includes("Embeddings")) return "Embeddings";
  return "Other";
}

function datasetTaskOf(project: Project): string | null {
  const tags = (project.repositoryDetails?.tags ?? []).map((t) =>
    t.toLowerCase()
  );
  if (tags.some((t) => t.includes("text-to-speech"))) return "TTS";
  if (
    tags.some(
      (t) =>
        t.includes("automatic-speech-recognition") ||
        t.includes("speech-recognition")
    )
  )
    return "ASR";
  if (tags.some((t) => t.includes("translation"))) return "Translation";
  if (tags.some((t) => t.includes("text-generation"))) return "LLM";
  if (
    tags.some(
      (t) => t.includes("token-classification") || t.includes("named-entity")
    )
  )
    return "NER";
  if (
    tags.some(
      (t) => t.includes("embedding") || t.includes("feature-extraction")
    )
  )
    return "Embeddings";
  return "Other";
}

export interface LanguagePageData {
  name: string;
  slug: string;
  glyph: string;
  models: Project[];
  datasets: Project[];
  papers: PaperRecord[];
  coverage: {
    task: string;
    models: number;
    datasets: number;
    papers: number;
  }[];
  gaps: string[];
}

const TRACKED_TASKS = ["ASR", "TTS", "Translation", "LLM", "NER", "Embeddings"];

export function getLanguagePage(
  langSlug: string
): LanguagePageData | undefined {
  const language = languages.find((l) => l.slug === langSlug);
  if (!language) return undefined;
  const { name } = language;

  /* goha fixtures store languages as string[]; the OST type allows the
     GitHub map form — handle both, mirroring project-detail.view */
  const matchesProject = (project: Project) => {
    const langs = project.repositoryDetails?.languages;
    const langNames = Array.isArray(langs)
      ? (langs as string[])
      : Object.keys(langs ?? {});
    return (
      langNames.includes(name) ||
      (project.projectTechStacks ?? []).some((t) => t.name === name)
    );
  };

  const models = projects.filter(
    (p) =>
      matchesProject(p) && p.projectCategories?.some((c) => c.name === "Model")
  );
  const datasets = projects.filter(
    (p) =>
      matchesProject(p) &&
      p.projectCategories?.some((c) => c.name === "Dataset")
  );
  const papers = papersList.filter((p) => p.languages.includes(name));

  const coverage = TRACKED_TASKS.map((task) => ({
    task,
    models: models.filter((m) => modelTaskOf(m) === task).length,
    datasets: datasets.filter((d) => datasetTaskOf(d) === task).length,
    papers: papers.filter((p) => paperTaskOf(p) === task).length,
  }));
  const otherCoverage = {
    task: "Other",
    models: models.filter((m) => modelTaskOf(m) === "Other").length,
    datasets: datasets.filter((d) => datasetTaskOf(d) === "Other").length,
    papers: 0,
  };

  /* gap analysis — strictly derived from what is (and isn't) indexed */
  const gaps: string[] = [];
  for (const task of TRACKED_TASKS) {
    const cov = coverage.find((c) => c.task === task);
    if (cov && cov.models === 0 && cov.datasets === 0)
      gaps.push(`No ${task} models or datasets indexed for ${name} yet.`);
  }
  const unevaluated = models.filter(
    (m) => (m.evaluations ?? []).length === 0
  ).length;
  if (models.length > 0 && unevaluated > 0)
    gaps.push(
      `${unevaluated} of ${models.length} ${name} models have no published evaluation.`
    );
  const unlicensed = [...models, ...datasets].filter(
    (p) => !p.repositoryDetails?.license
  ).length;
  if (unlicensed > 0)
    gaps.push(
      `${unlicensed} ${name} assets don't declare a license — unclear for reuse.`
    );
  if (datasets.length === 0)
    gaps.push(`No datasets indexed for ${name} at all.`);

  return {
    ...language,
    models,
    datasets,
    papers,
    coverage: [...coverage, otherCoverage],
    gaps,
  };
}
