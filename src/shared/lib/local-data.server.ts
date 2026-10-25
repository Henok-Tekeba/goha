/**
 * Server/build-context access to goha's committed data.
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

/** goha fixtures store languages as string[]; the original type allowed the
    GitHub map form too, so reads remain union-safe. */
function languageNamesOf(project: Project): string[] {
  const langs = project.repositoryDetails?.languages;
  return Array.isArray(langs) ? (langs as string[]) : Object.keys(langs ?? {});
}

function projectLanguages(project: Project): Set<string> {
  return new Set([
    ...languageNamesOf(project),
    ...(project.projectTechStacks ?? [])
      .filter((stack) => stack.type === "LANGUAGE")
      .map((stack) => stack.name),
  ]);
}

export function getLanguageCoverageSummary() {
  const canonical = new Set(languages.map((language) => language.name));
  const assets = projects.filter((project) =>
    project.projectCategories?.some(
      (category) => category.name === "Model" || category.name === "Dataset"
    )
  );
  const taggedAssets = assets.filter((project) =>
    [...projectLanguages(project)].some((name) => canonical.has(name))
  ).length;
  const taggedPapers = papersList.filter((paper) =>
    paper.languages.some((name) => canonical.has(name))
  ).length;

  return {
    assets: assets.length,
    taggedAssets,
    untaggedAssets: assets.length - taggedAssets,
    papers: papersList.length,
    taggedPapers,
    untaggedPapers: papersList.length - taggedPapers,
  };
}

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
  const matchesProject = (project: Project) =>
    projectLanguages(project).has(name);

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

/* ---------------- gap report (build-time analysis) ---------------- */

export interface GapCell {
  task: string;
  assets: number;
  papers: number;
}

export interface GapReport {
  tasks: string[];
  languages: {
    name: string;
    slug: string;
    glyph: string;
    total: number;
    cells: GapCell[];
  }[];
  emptyCells: { language: string; slug: string; task: string }[];
  totalCells: number;
  evaluation: { evaluated: number; total: number };
  unmeasured: {
    name: string;
    org: string | null;
    projectId: string | null;
    downloads: number;
  }[];
  licensing: {
    total: number;
    assets: number;
    examples: { name: string; projectId: string | null; kind: string }[];
  };
  untagged: { assets: number; papers: number };
  researchOnly: { language: string; slug: string; task: string }[];
}

export function getGapReport(): GapReport {
  const perLanguage = languages
    .map((language) => {
      const page = getLanguagePage(language.slug);
      if (!page) return null;
      const cells = TRACKED_TASKS.map((task) => {
        const row = page.coverage.find((entry) => entry.task === task);
        return {
          task,
          assets: (row?.models ?? 0) + (row?.datasets ?? 0),
          papers: row?.papers ?? 0,
        };
      });
      const total =
        page.models.length + page.datasets.length + page.papers.length;
      return { ...language, cells, total };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => b.total - a.total);

  const emptyCells: GapReport["emptyCells"] = [];
  const researchOnly: GapReport["researchOnly"] = [];
  for (const language of perLanguage) {
    for (const cell of language.cells) {
      if (cell.assets === 0 && cell.papers === 0)
        emptyCells.push({
          language: language.name,
          slug: language.slug,
          task: cell.task,
        });
      if (cell.assets === 0 && cell.papers > 0)
        researchOnly.push({
          language: language.name,
          slug: language.slug,
          task: cell.task,
        });
    }
  }

  const models = projects.filter((project) =>
    project.projectCategories?.some((category) => category.name === "Model")
  );
  const evaluated = models.filter(
    (project) => (project.evaluations ?? []).length > 0
  ).length;
  const unmeasured = models
    .filter((project) => (project.evaluations ?? []).length === 0)
    .sort((a, b) => (b.downloadsMonthly ?? 0) - (a.downloadsMonthly ?? 0))
    .slice(0, 8)
    .map((project) => ({
      name: project.title,
      org: project.owner?.name ?? null,
      projectId: project.id ?? null,
      downloads: project.downloadsMonthly ?? 0,
    }));

  const assets = projects.filter((project) =>
    project.projectCategories?.some(
      (category) => category.name === "Model" || category.name === "Dataset"
    )
  );
  const unlicensed = assets.filter(
    (project) => !project.repositoryDetails?.license
  );
  const coverageSummary = getLanguageCoverageSummary();
  const licensing = {
    total: unlicensed.length,
    assets: assets.length,
    examples: unlicensed.slice(0, 6).map((project) => ({
      name: project.title,
      projectId: project.id ?? null,
      kind:
        project.projectCategories?.find(
          (category) => category.name === "Dataset"
        )?.name ?? "Model",
    })),
  };

  return {
    tasks: TRACKED_TASKS,
    languages: perLanguage,
    emptyCells,
    totalCells: perLanguage.length * TRACKED_TASKS.length,
    evaluation: { evaluated, total: models.length },
    unmeasured,
    licensing,
    untagged: {
      assets: coverageSummary.untaggedAssets,
      papers: coverageSummary.untaggedPapers,
    },
    researchOnly,
  };
}
