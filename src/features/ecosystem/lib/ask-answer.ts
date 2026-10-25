import type {
  LanguageCoveragePayload,
  Leaderboard,
  OrgRecord,
  PaperRecord,
} from "../types/ecosystem.types";
import type { AskEntity, ParsedAskQuery } from "./ask-parser";

export interface AskProject {
  id?: string;
  title: string;
  description: string;
  owner: { name: string } | null;
  downloadsMonthly?: number;
  paramCount?: number | null;
  evaluations?: unknown[];
  projectCategories?: { name: string }[];
  projectTechStacks?: { name: string; type?: string }[];
  repositoryDetails?: {
    languages?: string[] | Record<string, number>;
    license?: string | null;
  };
  updatedAt: string;
}

export interface AskItem {
  type: "model" | "dataset" | "paper" | "org" | "benchmark";
  title: string;
  subtitle: string;
  href: string;
  external?: boolean;
  meta?: string;
}

export interface AskGroup {
  label: string;
  items: AskItem[];
}

export interface AskAnswer {
  headline: string;
  body: string;
  groups: AskGroup[];
  suggestions: string[];
  understood: boolean;
}

export interface AskData {
  projects: AskProject[];
  papers: PaperRecord[];
  orgs: OrgRecord[];
  leaderboard: Leaderboard | null;
  coverage: LanguageCoveragePayload | null;
}

const KIND: Record<string, "model" | "dataset" | "company" | "research"> = {
  Model: "model",
  Dataset: "dataset",
  Company: "company",
  Research: "research",
};

const TRACKED_TASKS = ["ASR", "TTS", "Translation", "LLM", "NER", "Embeddings"];

function kindOf(project: AskProject) {
  return KIND[project.projectCategories?.[0]?.name ?? ""] ?? null;
}

function taskOf(project: AskProject): string | null {
  return project.projectCategories?.[1]?.name ?? null;
}

function languagesOf(project: AskProject): string[] {
  const langs = project.repositoryDetails?.languages;
  const list = Array.isArray(langs)
    ? (langs as string[])
    : Object.keys((langs as Record<string, number>) ?? {});
  const fromStacks = (project.projectTechStacks ?? [])
    .filter((stack) => stack.type === "LANGUAGE")
    .map((stack) => stack.name);
  return [...new Set([...list, ...fromStacks])];
}

function matchesLanguage(project: AskProject, language: string): boolean {
  const languages = languagesOf(project);
  if (languages.length > 0) return languages.includes(language);
  /* only fall back to the title when the card declares no language at all */
  return project.title.toLowerCase().includes(language.toLowerCase());
}

function matchesTask(project: AskProject, task: string): boolean {
  const declared = taskOf(project);
  if (declared === task) return true;
  /* an explicit non-Other task should not be overridden by title keywords */
  if (declared && declared !== "Other") return false;
  const title = project.title.toLowerCase();
  switch (task) {
    case "ASR":
      return /asr|speech|whisper|wav2vec|w2v|omni/.test(title);
    case "TTS":
      return /tts|voice|vits|speecht5|xtts|cosyvoice/.test(title);
    case "Translation":
      return /translat|nllb|mt\b/.test(title);
    case "LLM":
      return /llm|llama|gpt|qwen|gemma|instruct|chat/.test(title);
    case "Embeddings":
      return /embed|retriev|rerank|sentence/.test(title);
    case "NER":
      return /ner\b|entit/.test(title);
    case "OCR":
      return /ocr|trocr|handwrit/.test(title);
    default:
      return false;
  }
}

function matchesKeywords(haystack: string, keywords: string[]): boolean {
  if (keywords.length === 0) return true;
  const text = haystack.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

function projectItem(project: AskProject): AskItem {
  const task = taskOf(project);
  const language = languagesOf(project)[0];
  return {
    type: (kindOf(project) === "dataset" ? "dataset" : "model") as
      | "dataset"
      | "model",
    title: project.title,
    subtitle: [
      project.owner?.name,
      task,
      language,
      project.downloadsMonthly
        ? `${project.downloadsMonthly.toLocaleString("en")} downloads/mo`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    href: `/projects/${project.id}`,
    meta: project.downloadsMonthly
      ? `${Math.round((project.downloadsMonthly / 1000) * 10) / 10}k`
      : undefined,
  };
}

function paperItem(paper: PaperRecord): AskItem {
  return {
    type: "paper",
    title: paper.title,
    subtitle: [
      paper.authors.slice(0, 2).join(", "),
      paper.year,
      paper.languages.slice(0, 2).join(", "),
    ]
      .filter(Boolean)
      .join(" · "),
    href: paper.url ?? "/research",
    external: true,
    meta: paper.arxivId?.replace(/v\d+$/, ""),
  };
}

function orgItem(org: OrgRecord): AskItem {
  return {
    type: "org",
    title: org.name,
    subtitle: [
      org.kind === "company"
        ? "Company"
        : org.kind === "lab"
          ? "Lab"
          : "Builder",
      org.counts.models ? `${org.counts.models} models` : null,
      org.counts.datasets ? `${org.counts.datasets} datasets` : null,
      org.langs.slice(0, 2).join(", ") || null,
    ]
      .filter(Boolean)
      .join(" · "),
    href: `/orgs/${org.slug}`,
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function suggestionSet(query: ParsedAskQuery): string[] {
  const language = query.languages[0] ?? "Amharic";
  return [
    `${language} speech models`,
    `${language} datasets`,
    `What's missing for ${language}?`,
    `papers about ${language}`,
  ];
}

export function buildAskAnswer(
  query: ParsedAskQuery,
  data: AskData
): AskAnswer {
  const { projects, papers, orgs, leaderboard, coverage } = data;
  const language = query.languages[0] ?? null;

  /* ---------------- gaps ---------------- */
  if (query.intent === "gaps" && language) {
    const rows = coverage?.rows ?? [];
    const zeros = TRACKED_TASKS.filter((task) => {
      const row = rows.find((r) => r.task === task);
      const value = row?.[language];
      return typeof value === "number" ? value === 0 : true;
    });
    const langProjects = projects.filter(
      (p) => matchesLanguage(p, language) && kindOf(p)
    );
    const models = langProjects.filter((p) => kindOf(p) === "model");
    const datasets = langProjects.filter((p) => kindOf(p) === "dataset");
    const unevaluated = models.filter(
      (m) => (m.evaluations ?? []).length === 0
    ).length;

    const parts: string[] = [];
    if (zeros.length) parts.push(`nothing is indexed for ${zeros.join(", ")}`);
    if (models.length && unevaluated)
      parts.push(
        `${unevaluated} of ${models.length} models have no published evaluation`
      );
    const headline = `The gaps for ${language}`;
    const body = [
      `The index holds ${models.length} ${language} models and ${datasets.length} datasets.`,
      parts.length
        ? `Open problems: ${parts.join("; ")}.`
        : "Coverage is broad — the remaining gap is depth, not presence.",
    ].join(" ");

    return {
      headline,
      body,
      understood: true,
      groups: [
        {
          label: "Go deeper",
          items: [
            {
              type: "benchmark",
              title: `${language} coverage map`,
              subtitle: "Tasks, assets and the gaps still open",
              href: `/lang/${slugify(language)}`,
            },
            {
              type: "benchmark",
              title: "The full gap report",
              subtitle: "Empty cells, unmeasured models, unclear licensing",
              href: "/gaps",
            },
            {
              type: "benchmark",
              title: "Full leaderboard",
              subtitle: "Published evaluation results",
              href: "/leaderboard",
            },
          ],
        },
      ],
      suggestions: [
        `${language} speech models`,
        `papers about ${language}`,
        `most downloaded ${language} models`,
        "What's missing for Oromo?",
      ],
    };
  }

  /* ---------------- benchmark answers ---------------- */
  if (
    leaderboard &&
    (query.entities.includes("benchmark") ||
      query.tasks.includes("Benchmark") ||
      (query.sort === "best" && query.tasks.includes("ASR")))
  ) {
    const sections = leaderboard.sections.filter((section) => {
      if (query.tasks.includes("ASR") && section.task !== "ASR") return false;
      if (language)
        return section.rows.some((row) => row.languages.includes(language));
      return true;
    });
    const items: AskItem[] = [];
    let bestLine = "";
    for (const section of sections) {
      const rows = language
        ? section.rows.filter((row) => row.languages.includes(language))
        : section.rows;
      for (const row of rows.slice(0, 5)) {
        items.push({
          type: "benchmark",
          title: `${row.model} — ${row.display}`,
          subtitle: [row.org, row.metric, row.dataset, row.languages.join(", ")]
            .filter(Boolean)
            .join(" · "),
          href: row.projectId
            ? `/projects/${row.projectId}`
            : (row.source ?? "/leaderboard"),
          external: !row.projectId,
        });
      }
      if (!bestLine && rows[0]) {
        bestLine = `Best published ${rows[0].metric} for ${language ?? "the ecosystem"} is ${rows[0].display} (${rows[0].model}).`;
      }
    }

    if (items.length) {
      return {
        headline: `Published benchmarks${language ? ` for ${language}` : ""}`,
        body: bestLine || "Results as published by the model authors.",
        understood: true,
        groups: [{ label: "Leaderboard", items: items.slice(0, 8) }],
        suggestions: [
          `best ${language ?? "Amharic"} speech models`,
          `${language ?? "Amharic"} speech models`,
          "compare models",
          "What's missing for Tigrinya?",
        ],
      };
    }
  }

  /* ---------------- lookup ---------------- */
  const wantsOrg = query.entities.includes("org");
  const wantsPaper = query.entities.includes("paper");
  const wantsDataset = query.entities.includes("dataset");
  const wantsModel =
    query.entities.includes("model") ||
    (!wantsOrg && !wantsPaper && !wantsDataset);

  const filteredProjects = projects.filter((project) => {
    const kind = kindOf(project);
    if (!kind || kind === "company") return false;
    if (kind === "model" && !wantsModel && !wantsDataset) return false;
    if (kind === "dataset" && !wantsDataset && !wantsModel) return false;
    if (language && !matchesLanguage(project, language)) return false;
    if (
      query.tasks.length &&
      !query.tasks.some((task) => matchesTask(project, task))
    )
      return false;
    if (
      query.maxParams &&
      (project.paramCount ?? Number.POSITIVE_INFINITY) > query.maxParams
    )
      return false;
    if (query.license && project.repositoryDetails?.license) {
      if (
        !String(project.repositoryDetails.license)
          .toLowerCase()
          .includes(query.license)
      )
        return false;
    }
    if (
      !matchesKeywords(
        `${project.title} ${project.description} ${project.owner?.name ?? ""}`,
        query.keywords
      )
    )
      return false;
    return true;
  });

  const models = filteredProjects.filter((p) => kindOf(p) === "model");
  const datasets = filteredProjects.filter((p) => kindOf(p) === "dataset");

  if (query.sort === "downloads" || !query.sort) {
    models.sort(
      (a, b) => (b.downloadsMonthly ?? 0) - (a.downloadsMonthly ?? 0)
    );
    datasets.sort(
      (a, b) => (b.downloadsMonthly ?? 0) - (a.downloadsMonthly ?? 0)
    );
  } else if (query.sort === "newest") {
    const byNewest = (a: AskProject, b: AskProject) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    models.sort(byNewest);
    datasets.sort(byNewest);
  }

  const filteredPapers =
    wantsPaper || query.keywords.length > 0
      ? papers.filter((paper) => {
          if (language && !paper.languages.includes(language)) return false;
          if (
            query.tasks.length &&
            !query.tasks.some((task) =>
              paper.tasks.some((t) =>
                t.toLowerCase().startsWith(task.toLowerCase())
              )
            )
          )
            return false;
          return matchesKeywords(
            `${paper.title} ${paper.abstract ?? ""} ${paper.authors.join(" ")}`,
            query.keywords
          );
        })
      : [];

  /* "who builds X" must mean orgs that actually publish X — not every org
     that happens to work in the language */
  const normOrgName = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const builders = new Set(
    projects
      .filter((project) => {
        if (kindOf(project) !== "model") return false;
        if (language && !matchesLanguage(project, language)) return false;
        if (
          query.tasks.length &&
          !query.tasks.some((task) => matchesTask(project, task))
        )
          return false;
        return true;
      })
      .map((project) => normOrgName(project.owner?.name ?? ""))
      .filter(Boolean)
  );

  const filteredOrgs = wantsOrg
    ? orgs.filter((org) => {
        if (builders.size > 0 && !builders.has(normOrgName(org.name)))
          return false;
        if (language && !org.langs.includes(language)) return false;
        return matchesKeywords(`${org.name} ${org.desc ?? ""}`, query.keywords);
      })
    : [];

  const groups: AskGroup[] = [];
  if (models.length)
    groups.push({
      label: "Models",
      items: models.slice(0, 6).map(projectItem),
    });
  if (datasets.length)
    groups.push({
      label: "Datasets",
      items: datasets.slice(0, 6).map(projectItem),
    });
  if (filteredPapers.length)
    groups.push({
      label: "Research",
      items: filteredPapers.slice(0, 5).map(paperItem),
    });
  if (filteredOrgs.length)
    groups.push({
      label: "Organizations",
      items: filteredOrgs.slice(0, 5).map(orgItem),
    });

  const trueTotal =
    models.length +
    datasets.length +
    filteredPapers.length +
    filteredOrgs.length;

  if (trueTotal === 0) {
    return {
      headline: "Nothing indexed matches that yet",
      body: "I couldn't map that to a language, task or asset in the index. Try something like “Tigrinya speech models” or “What's missing for Oromo?”.",
      groups: [],
      suggestions: suggestionSet(query),
      understood: false,
    };
  }

  const noun =
    filteredOrgs.length > 0 && models.length === 0 && datasets.length === 0
      ? "organizations"
      : models.length && datasets.length
        ? "models and datasets"
        : datasets.length
          ? "datasets"
          : filteredPapers.length && models.length === 0
            ? "papers"
            : "models";
  const singular =
    noun === "organizations"
      ? "organization"
      : noun === "models and datasets"
        ? "model or dataset"
        : noun === "datasets"
          ? "dataset"
          : noun === "papers"
            ? "paper"
            : "model";
  const headline = [
    `${trueTotal}`,
    query.tasks.length ? query.tasks[0] : null,
    trueTotal === 1 ? singular : noun,
    language ? `for ${language}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const bodyParts: string[] = [];
  if (
    filteredOrgs.length > 0 &&
    models.length === 0 &&
    datasets.length === 0 &&
    query.tasks.length
  ) {
    bodyParts.push(
      `${filteredOrgs.length} organization${filteredOrgs.length === 1 ? "" : "s"} publish${filteredOrgs.length === 1 ? "es" : ""} ${query.tasks[0]} work${language ? ` for ${language}` : ""}.`
    );
  }
  if (models[0]?.downloadsMonthly)
    bodyParts.push(
      `Most downloaded: ${models[0].title} (${models[0].downloadsMonthly.toLocaleString("en")}/mo).`
    );
  if (language && query.tasks.includes("ASR") && leaderboard) {
    const asr = leaderboard.sections.find((s) => s.task === "ASR");
    const row = asr?.rows.find((r) => r.languages.includes(language));
    if (row)
      bodyParts.push(`Best published WER: ${row.display} (${row.model}).`);
  }
  if (filteredPapers.length)
    bodyParts.push(
      `${filteredPapers.length} related paper${filteredPapers.length === 1 ? "" : "s"} in the research index.`
    );

  return {
    headline,
    body: bodyParts.join(" ") || "Here's what the index holds.",
    groups,
    suggestions: suggestionSet(query),
    understood: true,
  };
}
