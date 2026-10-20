#!/usr/bin/env node
/**
 * build-goha-fixtures.mjs
 *
 * Bridges goha.et's data pipeline into OST's data layer:
 *   scraper → data/*.json  →  this script  →  src/mocks/fixtures/*  →  OST UI
 *
 * Reads goha's normalized JSON (models, datasets, companies, papers) and emits:
 *   1. src/mocks/fixtures/projects.mock.json   (Project[] in OST's exact shape)
 *   2. src/mocks/fixtures/taxonomy.mock.ts     (categories + techstacks regenerated)
 *   3. public/langs/*.svg                      (local language icons for next/image)
 *
 * Run after every scrape:  node scripts/build-goha-fixtures.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = (f) => path.join(ROOT, "data", f);
const FIXTURES = path.join(ROOT, "src", "mocks", "fixtures");
const LANGS_OUT = path.join(ROOT, "public", "langs");

const hex32 = (n) => n.toString(16).padStart(32, "0").slice(-32);
const id = (prefix, n) => `${prefix}_${hex32(n)}`;
const hash32 = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
};

/* goha language codes → display names */
const LANG_NAMES = {
  am: "Amharic",
  om: "Afaan Oromo",
  ti: "Tigrinya",
  gez: "Ge'ez",
  so: "Somali",
  aa: "Afarar",
  wal: "Wolayttattoo",
  haw: "Hadiyya",
  sid: "Sidaamu Afoo",
  ar: "Arabic",
  en: "English",
};
const langFromCode = (c) =>
  LANG_NAMES[c] ?? (c ? c.charAt(0).toUpperCase() + c.slice(1) : null);

/* devicon slugs for stacks that exist in devicon; everything else gets a local svg */
const DEVICON = {
  python: "python",
  pytorch: "pytorch",
  tensorflow: "tensorflow",
  transformers: null,
  jax: null,
  onnx: null,
  keras: "keras",
};
const devicon = (slug) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;

function dataArr(f) {
  const j = JSON.parse(readFileSync(DATA(f), "utf8"));
  return Array.isArray(j) ? j : j.data || j.items || [];
}

const models = dataArr("models.json");
const datasets = dataArr("datasets.json");
const companies = dataArr("companies.json");
const papers = dataArr("papers.json");

/* ---------------- taxonomy ---------------- */
const catNames = [
  "ASR",
  "Translation",
  "LLM",
  "NER",
  "Embeddings",
  "Dataset",
  "Company",
  "Research",
  "Other",
];
const categories = catNames.map((name, i) => ({ id: id("cat", i + 1), name }));
const catId = new Map(categories.map((c) => [c.name, c.id]));

/* stack usage counts from tags (models + datasets) */
const stackCount = new Map();
const langCount = new Map();
for (const it of [...models, ...datasets]) {
  for (const t of it.tags || []) {
    const low = t.toLowerCase();
    if (low.startsWith("language:")) {
      const name = langFromCode(low.split(":")[1]);
      if (name) langCount.set(name, (langCount.get(name) || 0) + 1);
    } else if (
      DEVICON[low] !== undefined &&
      !(low.startsWith("license") || low.startsWith("region"))
    ) {
      stackCount.set(low, (stackCount.get(low) || 0) + 1);
    } else if (
      [
        "safetensors",
        "text-generation",
        "text2text-generation",
        "token-classification",
      ].includes(low)
    ) {
      // skip label-ish tags
    }
  }
}

const now = "2026-01-01T00:00:00.000Z";
const tech = (n, name, iconUrl, type, i) => ({
  id: id("tst", n),
  name,
  iconUrl,
  type,
  createdAt: now,
  updatedAt: now,
});

const topLangs = [...langCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);
const topStacks = [...stackCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6);

const techStacks = [];
topLangs.forEach(([name], i) =>
  techStacks.push(
    tech(i + 1, name, `/langs/${langSlug(name)}.svg`, "LANGUAGE", i)
  )
);
topStacks.forEach(([name], i) => {
  const slug = DEVICON[name];
  techStacks.push(
    tech(
      50 + i,
      titleCase(name),
      slug ? devicon(slug) : `/langs/${langSlug(titleCase(name))}.svg`,
      "TECH",
      i
    )
  );
});
function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function langSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ---------------- language icons (local svgs) ---------------- */
mkdirSync(LANGS_OUT, { recursive: true });
for (const [name] of topLangs) {
  const glyph =
    name === "Amharic"
      ? "አ"
      : name === "Tigrinya"
        ? "ት"
        : name === "Ge'ez"
          ? "ግ"
          : name === "Afaan Oromo"
            ? "ኦ"
            : name.charAt(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2b7fff"/><text x="12" y="17" font-size="13" text-anchor="middle" fill="white" font-family="monospace" font-weight="bold">${glyph}</text></svg>`;
  writeFileSync(path.join(LANGS_OUT, `${langSlug(name)}.svg`), svg);
}

/* ---------------- projects ---------------- */
const iso = (s, fb) =>
  s && !isNaN(new Date(s).getTime()) ? new Date(s).toISOString() : fb;

function synthesizeDescription(typeLabel, d, name) {
  if (d && d.trim() && !/^\s*\n?\s*\t/.test(d) && d.trim().length > 20)
    return d.trim().replace(/\s+/g, " ");
  const bits = [];
  if (typeLabel) bits.push(typeLabel);
  if (d?.downloads_monthly)
    bits.push(
      `${Intl.NumberFormat("en", { notation: "compact" }).format(d.downloads_monthly)} monthly downloads`
    );
  return `Part of the goha.et catalogue for Ethiopian languages — ${bits.join(" · ") || name}`;
}

let pjtSeed = 0;
const projects = [];

/* models + datasets */
for (const src of [
  ...models.map((m) => ({ it: m, kind: "model" })),
  ...datasets.map((d) => ({ it: d, kind: "dataset" })),
]) {
  const it = src.it;
  const langs = [];
  for (const t of it.tags || []) {
    if (t.toLowerCase().startsWith("language:")) {
      const n = langFromCode(t.toLowerCase().split(":")[1]);
      if (n && !langs.includes(n)) langs.push(n);
    }
  }
  const stacks = (it.tags || [])
    .map((t) => t.toLowerCase())
    .filter((t) => DEVICON[t] !== undefined);

  const badge =
    it.type_label || it.badge || (src.kind === "dataset" ? "Dataset" : "Other");
  const catName = catNames.includes(badge)
    ? badge
    : src.kind === "dataset"
      ? "Dataset"
      : "Other";
  void catId;

  const created = iso(
    it.added_at,
    iso(it.last_updated, "2026-01-01T00:00:00.000Z")
  );
  const updated = iso(it.last_updated, created);
  const orgName = (it.id || it.name || "").split("/")[0] || it.name;

  projects.push({
    id: id("pjt", ++pjtSeed),
    title: it.name || it.id,
    description: synthesizeDescription(
      it.type_label || badge,
      it.description,
      it.name
    ),
    provider: "GITHUB",
    logoUrl: null,
    published: true,
    trending: (it.downloads_monthly ?? 0) > 5000 || (it.likes ?? 0) > 10,
    repoUrl: it.hf_url || null,
    githubUrl: null,
    gitlabUrl: null,
    twitterUrl: null,
    linkedinUrl: null,
    discordUrl: null,
    websiteUrl: it.hf_url || null,
    imagesUrls: [],
    owner: { id: id("usr", hash32(orgName)), name: orgName },
    projectTechStacks: [
      ...langs.map((n) => techStacks.find((t) => t.name === n)).filter(Boolean),
      ...stacks
        .map((n) => techStacks.find((t) => t.name.toLowerCase() === n))
        .filter(Boolean),
    ].slice(0, 6),
    projectCategories: [
      { id: catId.get(catName) ?? categories.at(-1).id, name: catName },
    ],
    repositoryDetails: {
      name: it.name || it.id,
      description: it.description
        ? String(it.description).replace(/\s+/g, " ").slice(0, 240)
        : null,
      url: it.hf_url || null,
      html_url: it.hf_url || null,
      created_at: created,
      updated_at: updated,
      pushed_at: updated,
      stars: it.likes ?? 0,
      tags: (it.tags || []).slice(0, 8),
      forksCount: 0,
      openIssuesCount: 0,
      pullRequestsCount: 0,
      subscribersCount: 0,
      license: it.license ?? null,
      languages: langs,
      owner: { login: orgName, avatar_url: "" },
      contributors: [],
      issues: [],
      issueLabels: [],
      pullRequests: [],
      readme: Buffer.from(
        `# ${it.name}\n\nIndexed by goha.et — the Ethiopian AI ecosystem directory.\n\n${synthesizeDescription(badge, it.description, it.name)}`
      ).toString("base64"),
    },
    createdAt: created,
    updatedAt: updated,
  });
}

/* companies */
for (const c of companies) {
  projects.push({
    id: id("pjt", ++pjtSeed),
    title: c.name,
    description: c.desc || `${c.name} — company in the Ethiopian AI ecosystem`,
    provider: "GITHUB",
    logoUrl: null,
    published: true,
    trending: Boolean(c.isNew),
    repoUrl: c.github || null,
    githubUrl: c.github || null,
    gitlabUrl: null,
    twitterUrl: null,
    linkedinUrl: null,
    discordUrl: null,
    websiteUrl: c.website || null,
    imagesUrls: [],
    owner: { id: id("usr", hash32(c.name)), name: c.name },
    projectTechStacks: (c.langs || [])
      .map((l) =>
        techStacks.find((t) => t.name.toLowerCase() === l.toLowerCase())
      )
      .filter(Boolean),
    projectCategories: [{ id: catId.get("Company"), name: "Company" }],
    repositoryDetails: {
      name: c.name,
      description: c.desc || null,
      url: c.github || null,
      html_url: c.github || c.website || null,
      created_at: c.founded
        ? new Date(`${c.founded}-01-01`).toISOString()
        : now,
      updated_at: now,
      pushed_at: now,
      stars: c.likes ?? 0,
      tags: (c.tags || []).slice(0, 8),
      forksCount: 0,
      openIssuesCount: 0,
      pullRequestsCount: 0,
      subscribersCount: 0,
      license: null,
      languages: c.langs || [],
      owner: { login: c.name, avatar_url: "" },
      contributors: [],
      issues: [],
      issueLabels: [],
      pullRequests: [],
      readme: Buffer.from(`# ${c.name}\n\n${c.desc}`).toString("base64"),
    },
    createdAt: c.founded ? new Date(`${c.founded}-01-01`).toISOString() : now,
    updatedAt: now,
  });
}

/* papers */
for (const p of papers) {
  const abs = `https://arxiv.org/abs/${p.arxiv_id}`;
  projects.push({
    id: id("pjt", ++pjtSeed),
    title: p.title,
    description:
      (p.abstract || "").replace(/\s+/g, " ").slice(0, 400) || p.title,
    provider: "GITHUB",
    logoUrl: null,
    published: true,
    trending: false,
    repoUrl: abs,
    githubUrl: null,
    gitlabUrl: null,
    twitterUrl: null,
    linkedinUrl: null,
    discordUrl: null,
    websiteUrl: abs,
    imagesUrls: [],
    owner: {
      id: id("usr", hash32(p.authors?.[0] || "arxiv")),
      name: p.authors?.[0] || "arXiv",
    },
    projectTechStacks: [],
    projectCategories: [{ id: catId.get("Research"), name: "Research" }],
    repositoryDetails: {
      name: p.title,
      description: (p.abstract || "").replace(/\s+/g, " ").slice(0, 240),
      url: abs,
      html_url: abs,
      created_at: p.published_date ? iso(p.published_date, now) : now,
      updated_at: p.published_date ? iso(p.published_date, now) : now,
      pushed_at: now,
      stars: 0,
      tags: (p.categories || []).slice(0, 8),
      forksCount: 0,
      openIssuesCount: 0,
      pullRequestsCount: 0,
      subscribersCount: 0,
      license: "arXiv",
      languages: [],
      owner: { login: p.authors?.[0] || "arXiv", avatar_url: "" },
      contributors: [],
      issues: [],
      issueLabels: [],
      pullRequests: [],
      readme: Buffer.from(`# ${p.title}\n\n${p.abstract || ""}`).toString(
        "base64"
      ),
    },
    createdAt: p.published_date ? iso(p.published_date, now) : now,
    updatedAt: p.published_date ? iso(p.published_date, now) : now,
  });
}

/* deterministic order assist: db.mock treats first three ids as "mine",
   index 5 as bookmarked and index 6 as claimable – keep most interesting first */
projects.sort(
  (a, b) =>
    (b.trending ? 1 : 0) - (a.trending ? 1 : 0) ||
    b.starsOf?.() - a.starsOf?.() ||
    0
);

mkdirSync(FIXTURES, { recursive: true });
writeFileSync(
  path.join(FIXTURES, "projects.mock.json"),
  JSON.stringify(projects, null, 1) + "\n"
);

/* regenerate taxonomy.mock.ts with goha's categories + languages */
const taxTs = `import type { CategoryType } from "@/shared/types/category.type";
import type { TechStackType } from "@/shared/types/tech-stack.type";

import { mockPublicId } from "../public-id.mock";

const now = new Date("2026-01-01T00:00:00.000Z").toISOString();

const tech = (
  id: string,
  name: string,
  iconUrl: string,
  type: TechStackType["type"]
): TechStackType => ({
  id,
  name,
  iconUrl,
  type,
  createdAt: now,
  updatedAt: now,
});

export const categories: CategoryType[] = [
${categories.map((c) => `  { id: mockPublicId("cat", ${categories.indexOf(c) + 1}), name: "${c.name}" },`).join("\n")}
];

export const techStacks: TechStackType[] = [
${techStacks.map((t, i) => `  tech(mockPublicId("tst", ${i + 1}), ${JSON.stringify(t.name)}, ${JSON.stringify(t.iconUrl)}, ${JSON.stringify(t.type)}),`).join("\n")}
];
`;
writeFileSync(path.join(FIXTURES, "taxonomy.mock.ts"), taxTs);

console.log(
  `✓ goha fixtures built:
    projects: ${projects.length} (models ${models.length} · datasets ${datasets.length} · companies ${companies.length} · papers ${papers.length})
    categories: ${categories.length} · techStacks: ${techStacks.length}
    language icons: ${topLangs.map(([n]) => langSlug(n)).join(", ")}`
);

/* fix repositoryDetails.languages typing parity with their fixture (kept as array) */
void dataArr;
