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
 *   3. public/langs/*.svg                      (premium monogram / symbol tiles)
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

/* ------------- language taxonomy (canonical names, full code coverage) ------------- */
const LANG_NAMES = {
  am: "Amharic",
  amh: "Amharic",
  om: "Afaan Oromo",
  orm: "Afaan Oromo",
  gaz: "Afaan Oromo",
  ti: "Tigrinya",
  tir: "Tigrinya",
  gez: "Ge'ez",
  zgh: "Ge'ez",
  so: "Somali",
  som: "Somali",
  aa: "Afaraf",
  aar: "Afaraf",
  wal: "Wolayttattoo",
  wol: "Wolayttattoo",
  haw: "Hadiyya",
  sid: "Sidaamu Afoo",
  en: "English",
  ar: "Arabic",
  ara: "Arabic",
};
const langFromCode = (c) => LANG_NAMES[c] ?? null;

/* canonical scripts/glyphs for premium monogram tiles */
const LANG_META = {
  Amharic: { glyph: "አ" },
  "Afaan Oromo": { glyph: "O" },
  Tigrinya: { glyph: "ት" },
  "Ge'ez": { glyph: "ግ" },
  Somali: { glyph: "S" },
  Afaraf: { glyph: "A" },
  Wolayttattoo: { glyph: "W" },
  Hadiyya: { glyph: "H" },
  "Sidaamu Afoo": { glyph: "S" },
  English: { glyph: "E" },
  Arabic: { glyph: "ع" },
};

/* stacks with real logos (devicon) or symbol tiles; proper display names */
const STACKS = [
  { tag: "pytorch", name: "PyTorch", devicon: "pytorch" },
  { tag: "tensorflow", name: "TensorFlow", devicon: "tensorflow" },
  { tag: "keras", name: "Keras", devicon: "keras" },
  { tag: "transformers", name: "Transformers", symbol: "layers" },
  { tag: "onnx", name: "ONNX", symbol: "graph" },
  { tag: "jax", name: "JAX", symbol: "bolt" },
  { tag: "tensorboard", name: "TensorBoard", symbol: "chart" },
  { tag: "safetensors", name: "Safetensors", symbol: "shield" },
  { tag: "diffusers", name: "Diffusers", symbol: "spark" },
  { tag: "peft", name: "PEFT", symbol: "link" },
];
const stackByTag = new Map(STACKS.map((s) => [s.tag, s]));

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
/* Type categories power the nav (Models/Datasets/Research/Companies);
   task categories (ASR, LLM...) remain available in the filter UI. */
const catNames = [
  "Model",
  "Dataset",
  "Company",
  "Research",
  "ASR",
  "Translation",
  "LLM",
  "NER",
  "Embeddings",
  "Other",
];
const categories = catNames.map((name, i) => ({ id: id("cat", i + 1), name }));
const catId = new Map(categories.map((c) => [c.name, c.id]));

/* per-type icon tiles (model cards never fall back to initials) */
const TYPE_ICONS = {
  asr: "audio",
  nmt: "translation",
  llm: "ai",
  ner: "ner",
  emb: "embedding",
  ds: "dataset",
  co: "company",
  paper: "research",
};
const KIND_ICONS = {
  model: "ai",
  dataset: "dataset",
  company: "company",
  paper: "research",
};
const typeIconFor = (it, kind) =>
  `/types/${TYPE_ICONS[it.bc] ?? KIND_ICONS[kind] ?? "ai"}.svg`;

/* usage counts (models + datasets) */
const stackCount = new Map();
const langCount = new Map();
for (const it of [...models, ...datasets]) {
  for (const t of it.tags || []) {
    const low = t.toLowerCase();
    if (low.startsWith("language:")) {
      const name = langFromCode(low.split(":")[1]);
      if (name) langCount.set(name, (langCount.get(name) || 0) + 1);
    } else if (stackByTag.has(low)) {
      stackCount.set(low, (stackCount.get(low) || 0) + 1);
    }
  }
}

const now = "2026-01-01T00:00:00.000Z";

const topLangs = [...langCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8);
const topStacks = [...stackCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([tag]) => stackByTag.get(tag));

const langSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const techStacks = [];
for (const [i, [name]] of topLangs.entries()) {
  techStacks.push({
    id: id("tst", i + 1),
    name,
    iconUrl: `/langs/${langSlug(name)}.svg`,
    type: "LANGUAGE",
  });
}
for (const [i, s] of topStacks.entries()) {
  techStacks.push({
    id: id("tst", 51 + i),
    name: s.name,
    iconUrl: s.devicon ? devicon(s.devicon) : `/langs/sym-${s.symbol}.svg`,
    type: "TECH",
  });
}

/* ---------------- premium tiles ---------------- */
/* gradient squircle tiles: dawn ramp, white glyph / symbol */
mkdirSync(LANGS_OUT, { recursive: true });
const TYPES_OUT = path.join(ROOT, "public", "types");
mkdirSync(TYPES_OUT, { recursive: true });

const tile = (
  inner,
  hue
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${hue === "blue" ? "#8ec5ff" : "#51a2ff"}"/>
      <stop offset="0.6" stop-color="#2b7fff"/>
      <stop offset="1" stop-color="#193cb8"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="24" height="24" rx="7" fill="url(#g)"/>
  <rect x="1" y="1" width="22" height="10" rx="6" fill="white" opacity="0.08"/>
  ${inner}
</svg>`;

const TYPE_SYMBOLS = {
  /* audio / ASR: waveform bars */
  audio: `<g fill="white"><rect x="4.5" y="10" width="2.2" height="4" rx="1.1"/><rect x="8.4" y="7" width="2.2" height="10" rx="1.1"/><rect x="12.3" y="4.5" width="2.2" height="15" rx="1.1" opacity="0.95"/><rect x="16.2" y="8" width="2.2" height="8" rx="1.1" opacity="0.85"/><rect x="20" y="11" width="2.2" height="2" rx="1" opacity="0.7"/></g>`,
  /* translation: two arrows across languages */
  translation: `<g stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h12M13.5 5.5L17 9l-3.5 3.5"/><path d="M19 16H7M10.5 12.5L7 16l3.5 3.5"/></g>`,
  /* ai / LLM: chip */
  ai: `<g fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M10 4v2M14 4v2M10 18v2M14 18v2M4 10h2M4 14h2M18 10h2M18 14h2"/></g><circle cx="12" cy="12" r="1.6" fill="white"/>`,
  /* ner: tag */
  ner: `<g fill="none" stroke="white" stroke-width="1.9" stroke-linejoin="round"><path d="M4.5 5.5A1.5 1.5 0 016 4h5.2c.4 0 .8.16 1.06.44l7.3 7.3a1.5 1.5 0 010 2.12l-5.2 5.2a1.5 1.5 0 01-2.12 0l-7.3-7.3A1.5 1.5 0 014.5 10.7V5.5z"/></g><circle cx="8.6" cy="8.6" r="1.3" fill="white"/>`,
  /* embeddings: dot grid */
  embedding: `<g fill="white"><circle cx="7" cy="7" r="1.7"/><circle cx="12" cy="7" r="1.7" opacity="0.85"/><circle cx="17" cy="7" r="1.7" opacity="0.7"/><circle cx="7" cy="12" r="1.7" opacity="0.85"/><circle cx="12" cy="12" r="1.7" opacity="0.65"/><circle cx="17" cy="12" r="1.7" opacity="0.5"/><circle cx="7" cy="17" r="1.7" opacity="0.65"/><circle cx="12" cy="17" r="1.7" opacity="0.5"/><circle cx="17" cy="17" r="1.7" opacity="0.4"/></g>`,
  /* dataset: table */
  dataset: `<g fill="none" stroke="white" stroke-width="1.9" stroke-linejoin="round"><rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M4.5 10h15M4.5 14h15M9.75 10v8.5" opacity="0.9"/></g>`,
  /* company: building */
  company: `<g fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19.5V6.8L12 4l7 2.8v12.7"/><path d="M5 19.5h14"/><path d="M9 19.5v-4h6v4" opacity="0.9"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" stroke-width="2.2"/></g>`,
  /* research: paper/scroll */
  research: `<g fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5h7.5L19 9v10.5a1 1 0 01-1 1H7a1 1 0 01-1-1v-14a1 1 0 011-1z"/><path d="M14 4.5V9h4.5" opacity="0.9"/><path d="M9 13h6M9 16.5h6" opacity="0.75"/></g>`,
};

for (const [key, sym] of Object.entries(TYPE_SYMBOLS)) {
  writeFileSync(path.join(TYPES_OUT, `${key}.svg`), tile(sym, "deep"));
}

const glyphTile = (glyph) =>
  tile(
    `<text x="12" y="16.5" font-size="12.5" text-anchor="middle" fill="white" font-weight="700" font-family="'Noto Sans Ethiopic', ui-sans-serif, system-ui, sans-serif">${glyph}</text>`,
    "blue"
  );

const SYMBOLS = {
  layers: `<path d="M12 4l7 3.5-7 3.5-7-3.5L12 4z" fill="white" opacity="0.95"/><path d="M5 12l7 3.5 7-3.5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/><path d="M5 16l7 3.5 7-3.5" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.45"/>`,
  graph: `<circle cx="8" cy="8" r="2.2" fill="white"/><circle cx="16.5" cy="10.5" r="2.2" fill="white" opacity="0.85"/><circle cx="10.5" cy="17" r="2.2" fill="white" opacity="0.7"/><path d="M8 8l8.5 2.5M16.5 10.5l-6 6.5M8 8l2.5 9" stroke="white" stroke-width="1.4" fill="none" opacity="0.8"/>`,
  bolt: `<path d="M13.5 3.5L6.5 13h4l-1.5 7.5L17.5 11h-4l1.5-7.5z" fill="white"/>`,
  chart: `<path d="M5 19V5" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M5 19h14" stroke="white" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/><path d="M7.5 14.5l3.5-4 3 2.5 4.5-5.5" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  shield: `<path d="M12 3.5l6.5 2.5v5c0 4.2-2.7 7.4-6.5 9-3.8-1.6-6.5-4.8-6.5-9V6l6.5-2.5z" fill="none" stroke="white" stroke-width="1.9" stroke-linejoin="round"/><path d="M9.2 12l2 2 3.8-4" fill="none" stroke="white" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  spark: `<path d="M12 4l1.7 4.8L18.5 10l-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.2L12 4z" fill="white"/><circle cx="17.5" cy="16.5" r="1.4" fill="white" opacity="0.7"/><circle cx="7" cy="16.5" r="1.1" fill="white" opacity="0.55"/>`,
  link: `<path d="M10 14a4 4 0 015.7 0l2.3 2.3a4 4 0 01-5.7 5.7l-1-1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M14 10a4 4 0 01-5.7 0L6 7.7A4 4 0 0111.7 2l1 1" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>`,
};

for (const [name] of topLangs) {
  const meta = LANG_META[name] ?? { glyph: name.charAt(0).toUpperCase() };
  writeFileSync(
    path.join(LANGS_OUT, `${langSlug(name)}.svg`),
    glyphTile(meta.glyph)
  );
}
for (const s of topStacks) {
  if (s.symbol)
    writeFileSync(
      path.join(LANGS_OUT, `sym-${s.symbol}.svg`),
      tile(SYMBOLS[s.symbol], "deep")
    );
}

/* ---------------- projects ---------------- */
const iso = (s, fb) =>
  s && !isNaN(new Date(s).getTime()) ? new Date(s).toISOString() : fb;

const nfCompact = new Intl.NumberFormat("en", { notation: "compact" });
const nfParams = (p) =>
  typeof p === "number" && p >= 1000
    ? nfCompact.format(p).replace("M", "M").toUpperCase() ===
      nfCompact.format(p)
      ? nfCompact
          .format(p)
          .toUpperCase()
          .replace(/([0-9])\./, "$1.")
      : nfCompact.format(p).toUpperCase()
    : String(p);

function cleanDesc(d) {
  if (!d) return "";
  const t = String(d).replace(/\s+/g, " ").trim();
  return t.length > 40 ? t : "";
}

/* rich README (rendered on the detail page by OST's markdown component) */
function readmeForModel(it, badge, langs, paramCount) {
  const lines = [];
  lines.push(`# ${it.name}`);
  lines.push("");
  lines.push(
    "> Indexed by goha.et — the Ethiopian AI ecosystem directory." +
      (badge ? ` **${badge}**` : "") +
      (langs.length ? ` · ${langs.join(", ")}` : "")
  );
  lines.push("");
  lines.push("## At a glance");
  lines.push("");
  lines.push("| | |");
  lines.push("|---|---|");
  lines.push(
    `| Monthly downloads | **${(it.downloads_monthly ?? 0).toLocaleString("en")}** |`
  );
  lines.push(`| Likes | ${(it.likes ?? 0).toLocaleString("en")} |`);
  if (paramCount) lines.push(`| Parameters | ${nfParams(paramCount)} |`);
  if (it.license) lines.push(`| License | \`${it.license}\` |`);
  if (it.wer_score != null) lines.push(`| WER (reported) | ${it.wer_score} |`);
  if (it.file_count) lines.push(`| Files | ${it.file_count} |`);
  if (it.last_updated)
    lines.push(
      `| Last updated | ${new Date(it.last_updated).toISOString().slice(0, 10)} |`
    );
  lines.push("");
  const desc = cleanDesc(it.description);
  if (desc) {
    lines.push("## About");
    lines.push("");
    lines.push(desc);
    lines.push("");
  }
  if (it.base_model) {
    lines.push("## Lineage");
    lines.push("");
    lines.push(`Fine-tuned from **${it.base_model}**`);
    lines.push("");
  }
  if (it.training_datasets?.length) {
    lines.push("## Trained on");
    lines.push("");
    for (const d of it.training_datasets) lines.push(`- ${d.name || d}`);
    lines.push("");
  }
  const evals = Array.isArray(it.eval_results)
    ? it.eval_results
    : (it.eval_results?.eval ?? []);
  if (evals.length) {
    lines.push("## Evaluation");
    lines.push("");
    lines.push("| Metric | Value | Dataset |");
    lines.push("|---|---|---|");
    for (const e of evals) {
      for (const m of e.metrics || []) {
        const val =
          typeof m.value === "number"
            ? m.value < 1 && /^wer|cer|error/i.test(m.name || m.type || "")
              ? `${(m.value * 100).toFixed(2)}%`
              : String(m.value)
            : String(m.value ?? "");
        lines.push(
          `| ${m.name || m.type} | ${val}${m.verified ? " ✓" : ""} | ${e.dataset?.name || "—"} |`
        );
      }
    }
    lines.push("");
  }
  if (langs.length) {
    lines.push("## Languages");
    lines.push("");
    for (const l of langs) lines.push(`- ${l}`);
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push(
    `[Open on Hugging Face](${it.hf_url}) · [goha.et](https://goha.et)`
  );
  return Buffer.from(lines.join("\n")).toString("base64");
}

function readmeSimple(title, body, link) {
  return Buffer.from(
    `# ${title}\n\n${body}\n\n${link ? `[Open source entry](${link}) · ` : ""}[goha.et](https://goha.et)`
  ).toString("base64");
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
  if ((it.langs || []).length) {
    for (const l of it.langs) {
      const n = LANG_NAMES[l] ?? titleCase(l);
      if (n && !langs.includes(n)) langs.push(n);
    }
  }

  const badge =
    it.type_label || it.badge || (src.kind === "dataset" ? "Dataset" : "Other");
  const catName = catNames.includes(badge)
    ? badge
    : src.kind === "dataset"
      ? "Dataset"
      : "Other";

  const created = iso(it.added_at, iso(it.last_updated, now));
  const updated = iso(it.last_updated, created);
  const orgName = (it.id || it.name || "").split("/")[0] || it.name;

  const stackObjs = (it.tags || [])
    .map((t) => stackByTag.get(t.toLowerCase()))
    .filter(Boolean);

  const paramCount =
    it.param_count ??
    it.tags
      ?.find?.((t) => /(\d+(\.\d+)?)([mb])\b/i.test(t))
      ?.match?.(/(\d+(\.\d+)?)([mb])/i)?.[0] ??
    null;
  const params = paramCount ? `${String(paramCount).toUpperCase()}` : null;

  projects.push({
    id: id("pjt", ++pjtSeed),
    title: it.name || it.id,
    description:
      cleanDesc(it.description) ||
      `${badge ? badge + " · " : ""}${[...langs].join(", ")}${it.downloads_monthly ? ` · ${nfCompact.format(it.downloads_monthly)} downloads/mo` : ""}`,
    provider: "GITHUB",
    logoUrl: typeIconFor(it, src.kind),
    published: true,
    trending: (it.downloads_monthly ?? 0) > 5000 || (it.likes ?? 0) > 10,
    /* goha ecosystem metrics */
    downloadsMonthly: it.downloads_monthly ?? 0,
    growth: typeof it.growth === "number" ? it.growth : null,
    sparkline:
      it.sparkline &&
      Array.isArray(it.sparkline.points) &&
      it.sparkline.points.length > 1
        ? {
            points: it.sparkline.points,
            timestamps: it.sparkline.timestamps ?? [],
          }
        : null,
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
      ...stackObjs
        .map((s) => techStacks.find((t) => t.name === s.name))
        .filter(Boolean),
    ].slice(0, 6),
    projectCategories: [
      {
        id:
          catId.get(src.kind === "dataset" ? "Dataset" : "Model") ??
          categories[0].id,
        name: src.kind === "dataset" ? "Dataset" : "Model",
      },
      { id: catId.get(catName) ?? categories.at(-1).id, name: catName },
    ],
    repositoryDetails: {
      name: it.name || it.id,
      description: cleanDesc(it.description)
        ? cleanDesc(it.description).slice(0, 240)
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
      readme: readmeForModel(it, badge, langs, paramCount),
      contributionFile: undefined,
      cocFile: undefined,
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
    logoUrl: "/types/company.svg",
    published: true,
    trending: Boolean(c.isNew),
    downloadsMonthly: 0,
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
      languages: (c.langs || []).map((l) => LANG_NAMES[l] ?? titleCase(l)),
      owner: { login: c.name, avatar_url: "" },
      contributors: [],
      issues: [],
      issueLabels: [],
      pullRequests: [],
      readme: readmeSimple(
        c.name,
        [
          c.desc,
          c.founded ? `Founded in ${c.founded}.` : null,
          (c.langs || []).length
            ? `Working in: ${c.langs.map((l) => LANG_NAMES[l] ?? l).join(", ")}.`
            : null,
        ]
          .filter(Boolean)
          .join(" "),
        c.website
      ),
      contributionFile: undefined,
      cocFile: undefined,
    },
    createdAt: c.founded ? new Date(`${c.founded}-01-01`).toISOString() : now,
    updatedAt: now,
  });
}

/* papers */
for (const p of papers) {
  const abs = `https://arxiv.org/abs/${p.arxiv_id}`;
  const authorsLine = (p.authors || []).join(", ");
  projects.push({
    id: id("pjt", ++pjtSeed),
    title: p.title,
    description: cleanDesc(p.abstract).slice(0, 400) || p.title,
    provider: "GITHUB",
    logoUrl: "/types/research.svg",
    published: true,
    trending: false,
    downloadsMonthly: 0,
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
      description: cleanDesc(p.abstract).slice(0, 240) || null,
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
      readme: readmeSimple(
        p.title,
        [authorsLine ? `*${authorsLine}*` : null, cleanDesc(p.abstract)]
          .filter(Boolean)
          .join("\n\n"),
        abs
      ),
      contributionFile: undefined,
      cocFile: undefined,
    },
    createdAt: p.published_date ? iso(p.published_date, now) : now,
    updatedAt: p.published_date ? iso(p.published_date, now) : now,
  });
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

projects.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

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
${categories
  .map(
    (c) =>
      `  { id: mockPublicId("cat", ${categories.indexOf(c) + 1}), name: "${c.name}" },`
  )
  .join("\n")}
];

export const techStacks: TechStackType[] = [
${techStacks
  .map(
    (t, i) =>
      `  tech(mockPublicId("tst", ${i + 1}), ${JSON.stringify(t.name)}, ${JSON.stringify(t.iconUrl)}, ${JSON.stringify(t.type)}),`
  )
  .join("\n")}
];
`;
writeFileSync(path.join(FIXTURES, "taxonomy.mock.ts"), taxTs);

console.log(
  `✓ goha fixtures built:
    projects: ${projects.length} (models ${models.length} · datasets ${datasets.length} · companies ${companies.length} · papers ${papers.length})
    categories: ${categories.length} · techStacks: ${techStacks.length}
    languages: ${topLangs.map(([n]) => n).join(", ")}
    stacks: ${topStacks.map((s) => s.name).join(", ")}`
);
