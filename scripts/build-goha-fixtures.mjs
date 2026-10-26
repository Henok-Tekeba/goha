#!/usr/bin/env node
/**
 * build-goha-fixtures.mjs
 *
 * Bridges goha's data pipeline into OST's data layer:
 *   scraper → data/*.json  →  this script  →  data/*.mock.*  →  OST UI
 *
 * Reads goha's normalized JSON (models, datasets, companies, papers) and emits:
 *   1. data/projects.mock.json   (Project[] in OST's exact shape)
 *   2. data/taxonomy.mock.ts     (categories + techstacks regenerated)
 *   3. public/langs/*.svg                      (premium monogram / symbol tiles)
 *
 * Run after every scrape:  node scripts/build-goha-fixtures.mjs
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isAsrModel } from "./model-classification.mjs";
import { diffProjects } from "./project-diff.mjs";
import { projectIdForSource, resolveSourceAlias } from "./project-id.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = (f) => path.join(ROOT, "data", f);
const FIXTURES = path.join(ROOT, "data");
const LANGS_OUT = path.join(ROOT, "public", "langs");
const SOURCE_ALIASES = JSON.parse(
  readFileSync(path.join(FIXTURES, "project-source-aliases.json"), "utf8")
);

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
/* One canonical set powers the homepage tiles, /lang pages, the radar and the
   gap report. Keep aliases here so ISO codes, English names and casing all
   normalize to the same display name before any count is computed. */
const CANONICAL_LANGUAGES = [
  { name: "Amharic", slug: "amharic", glyph: "አ" },
  { name: "Afaan Oromo", slug: "afaan-oromo", glyph: "O" },
  { name: "Tigrinya", slug: "tigrinya", glyph: "ት" },
  { name: "Ge'ez", slug: "geez", glyph: "ግ" },
  { name: "Somali", slug: "somali", glyph: "S" },
  { name: "Wolaytta", slug: "wolaytta", glyph: "W" },
  { name: "Sidaamu Afoo", slug: "sidaamu-afoo", glyph: "S" },
  { name: "English", slug: "english", glyph: "E" },
];
const CANONICAL_LANGUAGE_NAMES = new Set(
  CANONICAL_LANGUAGES.map((language) => language.name)
);

const LANG_NAMES = {
  am: "Amharic",
  amh: "Amharic",
  amharic: "Amharic",
  "afaan oromo": "Afaan Oromo",
  "afan oromo": "Afaan Oromo",
  om: "Afaan Oromo",
  orm: "Afaan Oromo",
  oro: "Afaan Oromo",
  or: "Afaan Oromo",
  gaz: "Afaan Oromo",
  oromo: "Afaan Oromo",
  ti: "Tigrinya",
  tir: "Tigrinya",
  tig: "Tigrinya",
  tigrinya: "Tigrinya",
  gez: "Ge'ez",
  zgh: "Ge'ez",
  geez: "Ge'ez",
  "ge'ez": "Ge'ez",
  so: "Somali",
  som: "Somali",
  somali: "Somali",
  aa: "Afaraf",
  aar: "Afaraf",
  afar: "Afaraf",
  afaraf: "Afaraf",
  wal: "Wolaytta",
  wol: "Wolaytta",
  wolaytta: "Wolaytta",
  wolayttattoo: "Wolaytta",
  haw: "Hadiyya",
  hadiyya: "Hadiyya",
  sid: "Sidaamu Afoo",
  sidama: "Sidaamu Afoo",
  sidamo: "Sidaamu Afoo",
  sidaamu: "Sidaamu Afoo",
  "sidaamu afoo": "Sidaamu Afoo",
  en: "English",
  eng: "English",
  english: "English",
  ar: "Arabic",
  ara: "Arabic",
  arabic: "Arabic",
  fr: "French",
  fra: "French",
  fre: "French",
  french: "French",
  zh: "Chinese",
  zho: "Chinese",
  chi: "Chinese",
  chinese: "Chinese",
  mul: "Multilingual",
  mu: "Multilingual",
  multilingual: "Multilingual",
};
const languageName = (value) => {
  const key = String(value ?? "")
    .trim()
    .toLowerCase();
  return LANG_NAMES[key] ?? null;
};
const langFromCode = (c) => languageName(c);

/* canonical scripts/glyphs for premium monogram tiles */
const LANG_META = Object.fromEntries(
  CANONICAL_LANGUAGES.map(({ name, glyph }) => [name, { glyph }])
);

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
for (const it of [...models, ...datasets]) {
  for (const t of it.tags || []) {
    const low = t.toLowerCase();
    if (!low.startsWith("language:") && stackByTag.has(low)) {
      stackCount.set(low, (stackCount.get(low) || 0) + 1);
    }
  }
}

const now = "2026-01-01T00:00:00.000Z";

const topStacks = [...stackCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([tag]) => stackByTag.get(tag));

const techStacks = [];
for (const [i, language] of CANONICAL_LANGUAGES.entries()) {
  techStacks.push({
    id: id("tst", i + 1),
    name: language.name,
    iconUrl: `/langs/${language.slug}.svg`,
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
  inner
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  ${inner}
</svg>`;

const TYPE_SYMBOLS = {
  /* audio / ASR: waveform bars */
  audio: `<g fill="#171717"><rect x="4.5" y="10" width="2.2" height="4" rx="1.1"/><rect x="8.4" y="7" width="2.2" height="10" rx="1.1"/><rect x="12.3" y="4.5" width="2.2" height="15" rx="1.1" opacity="0.95"/><rect x="16.2" y="8" width="2.2" height="8" rx="1.1" opacity="0.85"/><rect x="20" y="11" width="2.2" height="2" rx="1" opacity="0.7"/></g>`,
  /* translation: two arrows across languages */
  translation: `<g stroke="#171717" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9h12M13.5 5.5L17 9l-3.5 3.5"/><path d="M19 16H7M10.5 12.5L7 16l3.5 3.5"/></g>`,
  /* ai / LLM: chip */
  ai: `<g fill="none" stroke="#171717" stroke-width="1.9" stroke-linecap="round"><rect x="7" y="7" width="10" height="10" rx="2.5"/><path d="M10 4v2M14 4v2M10 18v2M14 18v2M4 10h2M4 14h2M18 10h2M18 14h2"/></g><circle cx="12" cy="12" r="1.6" fill="#171717"/>`,
  /* ner: tag */
  ner: `<g fill="none" stroke="#171717" stroke-width="1.9" stroke-linejoin="round"><path d="M4.5 5.5A1.5 1.5 0 016 4h5.2c.4 0 .8.16 1.06.44l7.3 7.3a1.5 1.5 0 010 2.12l-5.2 5.2a1.5 1.5 0 01-2.12 0l-7.3-7.3A1.5 1.5 0 014.5 10.7V5.5z"/></g><circle cx="8.6" cy="8.6" r="1.3" fill="#171717"/>`,
  /* embeddings: dot grid */
  embedding: `<g fill="#171717"><circle cx="7" cy="7" r="1.7"/><circle cx="12" cy="7" r="1.7" opacity="0.85"/><circle cx="17" cy="7" r="1.7" opacity="0.7"/><circle cx="7" cy="12" r="1.7" opacity="0.85"/><circle cx="12" cy="12" r="1.7" opacity="0.65"/><circle cx="17" cy="12" r="1.7" opacity="0.5"/><circle cx="7" cy="17" r="1.7" opacity="0.65"/><circle cx="12" cy="17" r="1.7" opacity="0.5"/><circle cx="17" cy="17" r="1.7" opacity="0.4"/></g>`,
  /* dataset: table */
  dataset: `<g fill="none" stroke="#171717" stroke-width="1.9" stroke-linejoin="round"><rect x="4.5" y="5.5" width="15" height="13" rx="2"/><path d="M4.5 10h15M4.5 14h15M9.75 10v8.5" opacity="0.9"/></g>`,
  /* company: building */
  company: `<g fill="none" stroke="#171717" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19.5V6.8L12 4l7 2.8v12.7"/><path d="M5 19.5h14"/><path d="M9 19.5v-4h6v4" opacity="0.9"/><path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" stroke-width="2.2"/></g>`,
  /* research: paper/scroll */
  research: `<g fill="none" stroke="#171717" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5h7.5L19 9v10.5a1 1 0 01-1 1H7a1 1 0 01-1-1v-14a1 1 0 011-1z"/><path d="M14 4.5V9h4.5" opacity="0.9"/><path d="M9 13h6M9 16.5h6" opacity="0.75"/></g>`,
};

for (const [key, sym] of Object.entries(TYPE_SYMBOLS)) {
  writeFileSync(path.join(TYPES_OUT, `${key}.svg`), tile(sym));
}

const glyphTile = (glyph) =>
  tile(
    `<text x="12" y="16.5" font-size="12.5" text-anchor="middle" fill="#171717" font-weight="700" font-family="'Noto Sans Ethiopic', ui-sans-serif, system-ui, sans-serif">${glyph}</text>`,
    "blue"
  );

const SYMBOLS = {
  layers: `<path d="M12 4l7 3.5-7 3.5-7-3.5L12 4z" fill="#171717" opacity="0.95"/><path d="M5 12l7 3.5 7-3.5" fill="none" stroke="#171717" stroke-width="1.8" stroke-linecap="round" opacity="0.75"/><path d="M5 16l7 3.5 7-3.5" fill="none" stroke="#171717" stroke-width="1.8" stroke-linecap="round" opacity="0.45"/>`,
  graph: `<circle cx="8" cy="8" r="2.2" fill="#171717"/><circle cx="16.5" cy="10.5" r="2.2" fill="#171717" opacity="0.85"/><circle cx="10.5" cy="17" r="2.2" fill="#171717" opacity="0.7"/><path d="M8 8l8.5 2.5M16.5 10.5l-6 6.5M8 8l2.5 9" stroke="#171717" stroke-width="1.4" fill="none" opacity="0.8"/>`,
  bolt: `<path d="M13.5 3.5L6.5 13h4l-1.5 7.5L17.5 11h-4l1.5-7.5z" fill="#171717"/>`,
  chart: `<path d="M5 19V5" stroke="#171717" stroke-width="1.8" stroke-linecap="round"/><path d="M5 19h14" stroke="#171717" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/><path d="M7.5 14.5l3.5-4 3 2.5 4.5-5.5" fill="none" stroke="#171717" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  shield: `<path d="M12 3.5l6.5 2.5v5c0 4.2-2.7 7.4-6.5 9-3.8-1.6-6.5-4.8-6.5-9V6l6.5-2.5z" fill="none" stroke="#171717" stroke-width="1.9" stroke-linejoin="round"/><path d="M9.2 12l2 2 3.8-4" fill="none" stroke="#171717" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`,
  spark: `<path d="M12 4l1.7 4.8L18.5 10l-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.2L12 4z" fill="#171717"/><circle cx="17.5" cy="16.5" r="1.4" fill="#171717" opacity="0.7"/><circle cx="7" cy="16.5" r="1.1" fill="#171717" opacity="0.55"/>`,
  link: `<path d="M10 14a4 4 0 015.7 0l2.3 2.3a4 4 0 01-5.7 5.7l-1-1" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round"/><path d="M14 10a4 4 0 01-5.7 0L6 7.7A4 4 0 0111.7 2l1 1" fill="none" stroke="#171717" stroke-width="2" stroke-linecap="round"/>`,
};

for (const language of CANONICAL_LANGUAGES) {
  const meta = LANG_META[language.name] ?? { glyph: language.glyph };
  writeFileSync(
    path.join(LANGS_OUT, `${language.slug}.svg`),
    glyphTile(meta.glyph)
  );
}
for (const s of topStacks) {
  if (s.symbol)
    writeFileSync(
      path.join(LANGS_OUT, `sym-${s.symbol}.svg`),
      tile(SYMBOLS[s.symbol])
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
    `[Open on Hugging Face](${it.hf_url}) · [goha.enoch.et](https://goha.enoch.et)`
  );
  return Buffer.from(lines.join("\n")).toString("base64");
}

function readmeSimple(title, body, link, linkLabel) {
  return Buffer.from(
    `# ${title}\n\n${body}\n\n${
      link ? `[${linkLabel || "Open original"}](${link}) · ` : ""
    }[goha.enoch.et](https://goha.enoch.et)`
  ).toString("base64");
}

/* entity ids → fixture project ids, so every ecosystem surface
   (activity feed, leaderboard, org pages) deep-links into detail pages */
const entityIdToProjectId = new Map();
const projects = [];

/* models + datasets */
for (const src of [
  ...models.map((m) => ({ it: m, kind: "model" })),
  ...datasets.map((d) => ({ it: d, kind: "dataset" })),
]) {
  const it = src.it;
  const langs = [];
  const addLanguage = (value) => {
    const name = languageName(value);
    if (name && !langs.includes(name)) langs.push(name);
  };
  for (const t of it.tags || []) {
    if (String(t).toLowerCase().startsWith("language:")) {
      addLanguage(String(t).toLowerCase().split(":")[1]);
    }
  }
  for (const l of it.langs || []) addLanguage(l);
  /* the scraper's own language confirmation (ISO codes) — often richer than tags */
  for (const l of it.confirmed_languages || []) addLanguage(l);
  /* name-based fallback — ecosystem convention puts the language in the name
     ("hohe-asr-amharic", "whisper-small-tigrinya-r-32"). Run this even when
     other metadata exists: a card tagged "multilingual" should still count as
     Amharic when its name declares Amharic. */
  {
    const nm = String(it.name || it.id || "");
    const NAME_LANGS = [
      ["Amharic", /amharic|አማርኛ/i],
      ["Afaan Oromo", /oromo|afaan/i],
      ["Tigrinya", /tigrinya/i],
      ["Ge'ez", /ge'?ez/i],
      ["Somali", /\bsomali\b/i],
    ];
    for (const [n, re] of NAME_LANGS) {
      if (re.test(nm) && !langs.includes(n)) langs.push(n);
    }
  }
  /* canonical languages first so cards and filters show an Ethiopian
     language rather than "Multilingual" */
  langs.sort(
    (a, b) =>
      Number(!CANONICAL_LANGUAGE_NAMES.has(a)) -
      Number(!CANONICAL_LANGUAGE_NAMES.has(b))
  );

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

  /* goha's scrape rarely captures model-card prose (HF API gives none), so
     cards previously showed a fake "ASR · Amharic · 73k downloads/mo" line.
     Synthesize an honest one-liner from typed metadata instead. */
  const TASK_NOUN = {
    ASR: "Speech recognition",
    TTS: "Text-to-speech",
    Translation: "Machine translation",
    Classification: "Text classification",
    LLM: "Language",
    "Masked LM": "Masked language",
    NLP: "NLP",
    Embeddings: "Text embedding",
    NER: "Named entity recognition",
    "Image Generation": "Image generation",
    Vision: "Vision",
  };
  const taskNoun = TASK_NOUN[badge] ?? null;
  const kindWord = src.kind === "dataset" ? "dataset" : "model";
  const synthesized = taskNoun
    ? `${taskNoun} ${kindWord}${langs.length ? ` for ${langs.slice(0, 3).join(", ")}` : ""}.`
    : `${titleCase(kindWord)}${langs.length ? ` for ${langs.slice(0, 3).join(", ")}` : ""}.`;
  const baseNote = it.base_model ? ` Fine-tuned from ${it.base_model}.` : "";
  const sourceId = resolveSourceAlias(
    `${src.kind === "dataset" ? "hf-dataset" : "hf"}:${it.id}`,
    SOURCE_ALIASES
  );
  const projectId = projectIdForSource(sourceId);

  projects.push({
    id: projectId,
    sourceId,
    hfInternalId: it.hf_internal_id ?? null,
    hfSha: it.hf_sha ?? null,
    title: it.name || it.id,
    description: cleanDesc(it.description) || `${synthesized}${baseNote}`,
    provider: "GITHUB",
    logoUrl: typeIconFor(it, src.kind),
    published: true,
    trending: (it.downloads_monthly ?? 0) > 5000 || (it.likes ?? 0) > 10,
    /* goha ecosystem metrics */
    downloadsMonthly: it.downloads_monthly ?? 0,
    evaluations:
      src.kind === "model" && Array.isArray(it.eval_results)
        ? it.eval_results
        : [],
    baseModel: it.base_model ?? null,
    paramCount: paramCount ?? null,
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
  entityIdToProjectId.set(it.id, projectId);
}

/* companies */
for (const c of companies) {
  const sourceId = resolveSourceAlias(`company:${c.name}`, SOURCE_ALIASES);
  const projectId = projectIdForSource(sourceId);
  projects.push({
    id: projectId,
    sourceId,
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
      languages: (c.langs || []).map((l) => languageName(l) ?? titleCase(l)),
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
            ? `Working in: ${c.langs
                .map((l) => languageName(l) ?? l)
                .join(", ")}.`
            : null,
        ]
          .filter(Boolean)
          .join(" "),
        c.website,
        "Open website"
      ),
      contributionFile: undefined,
      cocFile: undefined,
    },
    createdAt: c.founded ? new Date(`${c.founded}-01-01`).toISOString() : now,
    updatedAt: now,
  });
  entityIdToProjectId.set(`company:${c.name}`, projectId);
}

/* papers */
for (const p of papers) {
  const abs = `https://arxiv.org/abs/${p.arxiv_id}`;
  const authorsLine = (p.authors || []).join(", ");
  const sourceId = resolveSourceAlias(`arxiv:${p.arxiv_id}`, SOURCE_ALIASES);
  const projectId = projectIdForSource(sourceId);
  projects.push({
    id: projectId,
    sourceId,
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
        abs,
        "Open on arXiv"
      ),
      contributionFile: undefined,
      cocFile: undefined,
    },
    createdAt: p.published_date ? iso(p.published_date, now) : now,
    updatedAt: p.published_date ? iso(p.published_date, now) : now,
  });
  entityIdToProjectId.set(`paper:${p.arxiv_id}`, projectId);
}

function titleCase(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------- ecosystem surfaces ----------------
   goha's committed data carries more than the grid shows: an activity
   feed, aggregate stats, weekly movers, org footprints, published
   evaluations and paper records. These emits surface all of it. */

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const fmtAgo = (at, ref) => {
  const t = new Date(at).getTime();
  if (!t) return "";
  const mins = Math.max(1, Math.round((ref - t) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
};

/* A fixture rebuild is not a scrape. When rebuilding the committed snapshot
   without new data, set GOHA_BUILD_TIME to the snapshot's indexedAt so
   freshness labels do not claim a newer scrape than the data. */
const buildTime = process.env.GOHA_BUILD_TIME
  ? new Date(process.env.GOHA_BUILD_TIME).getTime()
  : Date.now();

/* ---------- activity feed ---------- */
const ACTIVITY_URL = {
  model: (id) => `https://huggingface.co/${id}`,
  dataset: (id) => `https://huggingface.co/datasets/${id}`,
  space: (id) => `https://huggingface.co/spaces/${id}`,
  paper: (id) => `https://arxiv.org/abs/${id}`,
  repo: (id) => `https://github.com/${id}`,
};
const ACTIVITY_TYPE_LABEL = {
  new_model: "Model",
  new_dataset: "Dataset",
  new_paper: "Research",
  milestone: "Milestone",
  trending: "Momentum",
};

const activityRaw = JSON.parse(
  readFileSync(DATA("activity_feed.json"), "utf8")
);
const activity = (Array.isArray(activityRaw) ? activityRaw : [])
  .map((e, i) => {
    const type = e.type || "new_model";
    const entityUrl = (ACTIVITY_URL[e.entity_type] ?? ACTIVITY_URL.model)(
      e.entity_id || ""
    );
    return {
      id: e.id ?? i,
      type,
      label: ACTIVITY_TYPE_LABEL[type] ?? "Update",
      title:
        type === "new_model"
          ? `New model: ${e.metadata?.name ?? e.entity_id}`
          : type === "new_dataset"
            ? `New dataset: ${e.metadata?.name ?? e.entity_id}`
            : type === "new_paper"
              ? `New paper: ${String(e.message || "").replace(/^New paper: /, "")}`
              : e.message || e.title || type,
      detail: ["milestone", "trending"].includes(type)
        ? String(e.message || "")
        : null,
      entityId: e.entity_id ?? null,
      entityType: e.entity_type ?? null,
      projectId:
        (type === "new_paper"
          ? entityIdToProjectId.get(`paper:${e.entity_id}`)
          : entityIdToProjectId.get(e.entity_id)) ?? null,
      url: entityUrl,
      at: e.created_at ?? null,
      ago: e.created_at ? fmtAgo(e.created_at, buildTime) : null,
    };
  })
  .sort((a, b) => new Date(b.at) - new Date(a.at))
  .slice(0, 140);

/* ---------- aggregate stats ---------- */
const spaces = dataArr("spaces.json");
const repos = dataArr("repos.json");

const stats = {
  counts: {
    models: models.length,
    datasets: datasets.length,
    papers: papers.length,
    companies: companies.length,
    spaces: spaces.length,
    repos: repos.length,
    languages: CANONICAL_LANGUAGES.length,
    orgs: 0 /* filled after the org aggregation below */,
  },
  indexedAt: new Date(buildTime).toISOString(),
  featured: (() => {
    const top = [...models].sort(
      (a, b) => (b.downloads_monthly ?? 0) - (a.downloads_monthly ?? 0)
    )[0];
    return top
      ? {
          name: top.name,
          org: (top.id || "").split("/")[0] || null,
          downloads: top.downloads_monthly ?? 0,
        }
      : null;
  })(),
};

/* ---------- insights (weekly movers) ---------- */
const insightsRaw = JSON.parse(
  readFileSync(DATA("stats_insights.json"), "utf8")
);
const insights = {
  topGainers: (insightsRaw.topGainers || [])
    /* Movers must reference an indexed record — entries without one (e.g.
       models pruned from the index) are dropped, never surfaced. */
    .filter((g) => entityIdToProjectId.has(g.id))
    .slice(0, 12)
    .map((g) => ({
      id: g.id,
      name: g.name,
      org: g.org,
      growth: g.growth,
      gain: g.gain,
      start: g.start,
      end: g.end,
      projectId: entityIdToProjectId.get(g.id) ?? null,
    })),
  mostDownloaded: [...models]
    .sort((a, b) => (b.downloads_monthly ?? 0) - (a.downloads_monthly ?? 0))
    .slice(0, 10)
    .map((m) => ({
      id: m.id,
      name: m.name,
      org: (m.id || "").split("/")[0] || null,
      dl: m.downloads_monthly ?? 0,
      projectId: entityIdToProjectId.get(m.id) ?? null,
    })),
  builtAt: new Date(buildTime).toISOString(),
};

/* ---------- org directory ---------- */
/* footprints aggregated from every entity type, merged with the curated
   companies file (name, website, founding year) where they match */
const normOrgKey = (s) =>
  String(s || "")
    .trim()
    .replace(/^https?:\/\/[^/]+\//, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const orgMap = new Map();
function ensureOrg(key, displayName) {
  if (!orgMap.has(key))
    orgMap.set(key, {
      displayName: null,
      models: 0,
      datasets: 0,
      spaces: 0,
      repos: 0,
      downloads: 0,
      likes: 0,
      langs: new Set(),
      urls: new Set(),
      descriptions: new Map(),
      topModels: [],
      topRepos: [],
      topSpaces: [],
    });
  const o = orgMap.get(key);
  o.displayName ??= displayName || null;
  return o;
}
function noteLangs(o, it) {
  for (const t of it.tags || []) {
    if (String(t).toLowerCase().startsWith("language:")) {
      const n = langFromCode(String(t).toLowerCase().split(":")[1]);
      if (n) o.langs.add(n);
    }
  }
  for (const l of it.langs || []) {
    const n = languageName(l);
    if (n) o.langs.add(n);
  }
}
function noteDescription(o, d) {
  const clean = cleanDesc(d);
  if (clean) o.descriptions.set(clean, (o.descriptions.get(clean) || 0) + 1);
}
function orgFromName(idOrName) {
  const first = String(idOrName || "").split("/")[0];
  return first || idOrName;
}

for (const m of models) {
  const o = ensureOrg(normOrgKey(orgFromName(m.id)), orgFromName(m.id));
  o.models += 1;
  o.downloads += m.downloads_monthly ?? 0;
  o.likes += m.likes ?? 0;
  noteLangs(o, m);
  noteDescription(o, m.description);
  if (m.hf_url) o.urls.add(m.hf_url);
  o.topModels.push({
    name: m.name,
    id: m.id,
    projectId: entityIdToProjectId.get(m.id) ?? null,
    dl: m.downloads_monthly ?? 0,
  });
}
for (const d of datasets) {
  const o = ensureOrg(normOrgKey(orgFromName(d.id)), orgFromName(d.id));
  o.datasets += 1;
  o.downloads += d.downloads_monthly ?? 0;
  o.likes += d.likes ?? 0;
  noteLangs(o, d);
  noteDescription(o, d.description);
  if (d.hf_url) o.urls.add(d.hf_url);
}
for (const s of spaces) {
  const spaceOrg = s.org || s.author || "";
  if (!spaceOrg) continue;
  const o = ensureOrg(normOrgKey(spaceOrg), spaceOrg);
  o.spaces += 1;
  o.likes += s.likes ?? 0;
  noteDescription(o, s.desc);
  if (s.url) o.urls.add(s.url);
  o.topSpaces.push({
    name: s.name,
    url: s.url ?? null,
    likes: s.likes ?? 0,
  });
}
for (const r of repos) {
  const repoOwner = orgFromName(r.full_name);
  if (!repoOwner) continue;
  const o = ensureOrg(normOrgKey(repoOwner), repoOwner);
  o.repos += 1;
  o.likes += r.stars ?? 0;
  noteDescription(o, r.description);
  if (r.url) o.urls.add(r.url);
  o.topRepos.push({
    name: r.full_name,
    url: r.url ?? null,
    stars: r.stars ?? 0,
    desc: cleanDesc(r.description) || null,
  });
}

/* curated company data joins by normalized key (hf org, github or name) */
const curatedByKey = new Map();
for (const c of companies) {
  for (const k of [c.hf_org, c.github, c.name]) {
    const nk = normOrgKey(k);
    if (nk && !curatedByKey.has(nk)) curatedByKey.set(nk, c);
  }
}

const footprintOf = (c) =>
  c.counts.models +
  c.counts.datasets * 0.5 +
  c.counts.repos * 2 +
  c.counts.spaces * 0.5;

const usedSlugs = new Set();
const orgs = [];
for (const [key, o] of orgMap) {
  const footprint = footprintOf({
    counts: {
      models: o.models,
      datasets: o.datasets,
      repos: o.repos,
      spaces: o.spaces,
    },
  });
  if (footprint < 1) continue;
  const curated = curatedByKey.get(key) ?? null;
  const descriptions = [...o.descriptions.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const name = curated?.name || o.displayName || key;
  let slug = slugify(name) || slugify(key);
  while (usedSlugs.has(slug)) slug = `${slug}-2`;
  usedSlugs.add(slug);
  orgs.push({
    slug,
    key,
    name,
    kind: curated
      ? "company"
      : o.repos > 0 && o.models === 0 && o.datasets === 0
        ? "lab"
        : "individual",
    desc: curated?.desc || descriptions[0]?.[0]?.slice(0, 200) || null,
    website: curated?.website || null,
    github: curated?.github || null,
    hfOrg: curated?.hf_org || null,
    founded: curated?.founded || null,
    verified: Boolean(curated?.verified),
    isNew: Boolean(curated?.isNew),
    featured: Boolean(curated?.featured),
    langs: [
      ...new Set([
        ...o.langs,
        ...(curated?.langs || []).map((l) => languageName(l) ?? titleCase(l)),
      ]),
    ].sort(),
    counts: {
      models: o.models,
      datasets: o.datasets,
      spaces: o.spaces,
      repos: o.repos,
    },
    downloadsMonthly: o.downloads,
    likes: o.likes,
    topModels: o.topModels.sort((a, b) => b.dl - a.dl).slice(0, 5),
    topRepos: o.topRepos.sort((a, b) => b.stars - a.stars).slice(0, 6),
    topSpaces: o.topSpaces.sort((a, b) => b.likes - a.likes).slice(0, 4),
  });
}
/* a curated company can own several handles (HF org + GitHub org) — merge
   entries that resolve to the same organization name */
const mergedOrgs = new Map();
for (const org of orgs) {
  const key = org.name.toLowerCase();
  const existing = mergedOrgs.get(key);
  if (!existing) {
    mergedOrgs.set(key, { ...org });
    continue;
  }
  existing.counts = {
    models: existing.counts.models + org.counts.models,
    datasets: existing.counts.datasets + org.counts.datasets,
    spaces: existing.counts.spaces + org.counts.spaces,
    repos: existing.counts.repos + org.counts.repos,
  };
  existing.downloadsMonthly += org.downloadsMonthly;
  existing.likes += org.likes;
  existing.langs = [...new Set([...existing.langs, ...org.langs])].sort();
  existing.topModels = [...existing.topModels, ...org.topModels]
    .sort((a, b) => b.dl - a.dl)
    .slice(0, 5);
  existing.topRepos = [...existing.topRepos, ...org.topRepos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6);
  existing.topSpaces = [...existing.topSpaces, ...org.topSpaces]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);
}
/* curated companies are part of the ecosystem even with zero public assets —
   make sure every one of them has a profile */
for (const company of companies) {
  const key = company.name.toLowerCase();
  if (mergedOrgs.has(key)) continue;
  mergedOrgs.set(key, {
    slug: slugify(company.name),
    key: normOrgKey(company.name),
    name: company.name,
    kind: "company",
    desc: company.desc ?? null,
    website: company.website ?? null,
    github: company.github ?? null,
    hfOrg: company.hf_org ?? null,
    founded: company.founded ?? null,
    verified: Boolean(company.verified),
    isNew: Boolean(company.isNew),
    featured: Boolean(company.featured),
    langs: (company.langs || [])
      .map((l) => languageName(l) ?? titleCase(l))
      .sort(),
    counts: { models: 0, datasets: 0, spaces: 0, repos: 0 },
    downloadsMonthly: 0,
    likes: 0,
    topModels: [],
    topRepos: [],
    topSpaces: [],
  });
}

const mergedOrgList = [...mergedOrgs.values()];

mergedOrgList.sort((a, b) => footprintOf(b) - footprintOf(a));
stats.counts.orgs = mergedOrgList.length;

projects.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));

/* ---------- id continuity ---------- */
/* A rename is not detectable from the new scrape alone. When the alias map is
   updated, carry the previous project id forward as a static redirect. */
const legacyPath = path.join(FIXTURES, "legacy-project-ids.json");
const previousProjectsPath = path.join(FIXTURES, "projects.mock.json");
const legacyIds = existsSync(legacyPath)
  ? JSON.parse(readFileSync(legacyPath, "utf8"))
  : {};
const previousProjects = existsSync(previousProjectsPath)
  ? JSON.parse(readFileSync(previousProjectsPath, "utf8"))
  : [];
const aliasPath = path.join(FIXTURES, "project-source-aliases.json");
const { aliasesAdded, disappeared } = diffProjects(
  previousProjects,
  projects,
  SOURCE_ALIASES,
  legacyIds
);
/* Never emit a redirect to a record that no longer exists. Stale aliases are
   useful history but a static redirect to a 404 is not. */
const currentProjectIds = new Set(projects.map((project) => project.id));
for (const [oldId, targetId] of Object.entries(legacyIds)) {
  if (!currentProjectIds.has(targetId)) delete legacyIds[oldId];
}

const sortedAliases = Object.fromEntries(
  Object.entries(SOURCE_ALIASES).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(aliasPath, JSON.stringify(sortedAliases, null, 2) + "\n");
const sortedLegacyIds = Object.fromEntries(
  Object.entries(legacyIds).sort(([a], [b]) => a.localeCompare(b))
);
writeFileSync(legacyPath, JSON.stringify(sortedLegacyIds, null, 2) + "\n");
writeFileSync(
  path.join(FIXTURES, "project-diff.json"),
  JSON.stringify(
    {
      generatedAt: new Date(buildTime).toISOString(),
      previousCount: previousProjects.length,
      currentCount: projects.length,
      aliasesAdded,
      disappeared,
    },
    null,
    2
  ) + "\n"
);

/* Keep a small daily history so the live smoke test can detect id drift. */
const historyPath = path.join(FIXTURES, "project-id-history.json");
const history = existsSync(historyPath)
  ? JSON.parse(readFileSync(historyPath, "utf8"))
  : {};
const snapshotDate = new Date(buildTime).toISOString().slice(0, 10);
history[snapshotDate] = Object.fromEntries(
  projects.map((project) => [project.id, project.sourceId])
);
const historyDates = Object.keys(history).sort().slice(-30);
const trimmedHistory = Object.fromEntries(
  historyDates.map((date) => [date, history[date]])
);
writeFileSync(historyPath, JSON.stringify(trimmedHistory, null, 2) + "\n");

mkdirSync(FIXTURES, { recursive: true });
writeFileSync(
  path.join(FIXTURES, "projects.mock.json"),
  JSON.stringify(projects, null, 1) + "\n"
);

/* static data for GitHub Pages deployment (fetched client-side) */
const PUBLIC_DATA = path.join(ROOT, "public", "data");
mkdirSync(PUBLIC_DATA, { recursive: true });
writeFileSync(
  path.join(PUBLIC_DATA, "projects.json"),
  JSON.stringify(projects) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "taxonomy.json"),
  JSON.stringify({ categories, techStacks }) + "\n"
);

/* ---------- papers (research hub) ---------- */
const LANG_KEYWORDS = [
  ["Amharic", /amharic|አማርኛ/i],
  ["Afaan Oromo", /oromo|afaan/i],
  ["Tigrinya", /tigrinya|ትግር/i],
  ["Ge'ez", /ge'?ez|ethiopic/i],
  ["Somali", /\bsomali\b/i],
  ["Afaraf", /\bafar\b/i],
  ["Wolaytta", /wolaytt/i],
  ["Sidaamu Afoo", /sidamo/i],
  ["Hadiyya", /hadiyy|had.iya/i],
  ["English", /\benglish\b/i],
];
const TASK_KEYWORDS = [
  ["ASR", /\basr\b|speech (recognition|to text)|automatic speech recognition/i],
  ["TTS", /text.to.speech|\btts\b|speech synthesis/i],
  ["Translation", /\bnmt\b|machine translation|translat/i],
  ["LLM", /large language model|\bllm\b|language model/i],
  ["NER", /named entity|\bner\b/i],
  ["Embeddings", /embedding|representation learning/i],
  ["Benchmark", /\bbenchmark/i],
];

const paperSlugSeen = new Map();
const paperRecords = papers.map((p) => {
  const text = `${p.title} ${p.abstract || ""}`;
  const languages = LANG_KEYWORDS.filter(([, re]) => re.test(text)).map(
    ([n]) => n
  );
  const tasks = TASK_KEYWORDS.filter(([, re]) => re.test(text)).map(([n]) => n);
  let slug = slugify(p.title) || slugify(p.arxiv_id) || "paper";
  if (paperSlugSeen.has(slug)) {
    const n = paperSlugSeen.get(slug) + 1;
    paperSlugSeen.set(slug, n);
    slug = `${slug}-${n}`;
  } else paperSlugSeen.set(slug, 0);

  const published = iso(p.published_date, null);
  return {
    slug,
    arxivId: p.arxiv_id ?? null,
    title: p.title,
    authors: p.authors || [],
    abstract: cleanDesc(p.abstract) || null,
    published,
    year: published ? new Date(published).getUTCFullYear() : null,
    url: p.url || (p.arxiv_id ? `https://arxiv.org/abs/${p.arxiv_id}` : null),
    categories: (p.categories || []).slice(0, 8),
    languages,
    tasks,
    projectId: p.arxiv_id
      ? (entityIdToProjectId.get(`paper:${p.arxiv_id}`) ?? null)
      : null,
  };
});
paperRecords.sort(
  (a, b) => new Date(b.published ?? 0) - new Date(a.published ?? 0)
);

/* ---------- leaderboard (published evaluations) ---------- */
/* Only aggregates numbers that models publish about themselves
   (HF model-card eval tables). Every row cites its source. */
const PERCENT_METRIC =
  /wer|cer|eer|error|accura|precision|recall|\bf1\b|\bndcg\b|\bmap\b|\bmrr\b/i;
const SKIP_METRIC = /loss|sparsity|active|size|memory|latency/i;
const LOWER_IS_BETTER = /wer|cer|eer|error/i;
const TASK_SECTIONS = [
  {
    type: "automatic-speech-recognition",
    task: "ASR",
    name: "Automatic Speech Recognition",
    primary: "wer",
  },
  {
    type: "text-to-speech",
    task: "TTS",
    name: "Text-to-Speech",
    primary: "mos",
  },
  {
    type: "translation",
    task: "Translation",
    name: "Translation",
    primary: "bleu",
  },
  {
    type: "text-generation",
    task: "LLM",
    name: "Language Modeling",
    primary: null,
  },
  {
    type: "text-classification",
    task: "Classification",
    name: "Text Classification",
    primary: "accuracy",
  },
  {
    type: "token-classification",
    task: "NER",
    name: "Named Entity Recognition",
    primary: "f1",
  },
  {
    type: "information-retrieval",
    task: "Retrieval",
    name: "Information Retrieval",
    primary: "accuracy",
  },
  {
    type: "zero-shot-classification",
    task: "Classification",
    name: "Zero-shot Classification",
    primary: "accuracy",
  },
  {
    type: "question-answering",
    task: "QA",
    name: "Question Answering",
    primary: "f1",
  },
  {
    type: "feature-extraction",
    task: "Embeddings",
    name: "Feature Extraction",
    primary: null,
  },
];
const ASR_META = TASK_SECTIONS[0];
const DATASET_CONFIG_LANG = {
  am_et: "Amharic",
  tir_et: "Tigrinya",
  orm: "Afaan Oromo",
};

function modelLangsOf(it) {
  const out = [];
  for (const t of it.tags || []) {
    if (String(t).toLowerCase().startsWith("language:")) {
      const n = langFromCode(String(t).toLowerCase().split(":")[1]);
      if (n && !out.includes(n)) out.push(n);
    }
  }
  for (const l of it.langs || []) {
    const n = languageName(l);
    if (n && !out.includes(n)) out.push(n);
  }
  /* model names carry the language in ecosystem convention:
     "hohe-asr-amharic", "whisper-small-tigrinya-r-32" */
  if (out.length === 0) {
    const name = String(it.name || it.id || "");
    for (const [n, re] of LANG_KEYWORDS) {
      if (re.test(name) && !out.includes(n)) out.push(n);
    }
  }
  return out;
}

function normalizeMetric(type, value) {
  if (value == null) return { value: null, display: "" };
  /* model cards report numbers inconsistently — wer_score arrives as a string,
     fractions (<1) and percents (>=1) are both common */
  let num =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  if (isNaN(num)) return { value: null, display: "" };
  const lowerName = String(type || "").toLowerCase();
  if (PERCENT_METRIC.test(lowerName) && num > 0 && num < 1) num *= 100;
  return {
    value: num,
    display: PERCENT_METRIC.test(lowerName)
      ? `${num.toFixed(2)}%`
      : String(Math.round(num * 1000) / 1000),
  };
}

function embeddingDimOf(dataset) {
  const text = `${dataset?.name ?? ""} ${dataset?.type ?? ""}`;
  const match = text.match(/dim(?:ension)?[\s_:/-]*(\d{2,5})/i);
  if (!match) return null;
  const dim = Number(match[1]);
  return Number.isFinite(dim) ? dim : null;
}

function datasetSourceUrl(dataset) {
  const type = String(dataset?.type || "").trim();
  /* HF eval datasets look like "google/fleurs" or "org/name"; dimensions and
     internal names like "dev-ir" do not have their own dataset page. */
  if (/^[^/\s]+\/[^/\s]+$/.test(type) && !/^dim/i.test(type)) {
    return `https://huggingface.co/datasets/${type}`;
  }
  return null;
}

const sectionByKey = new Map();
const rowSeen = new Set();

function ensureSection(taskMeta) {
  if (!sectionByKey.has(taskMeta.type)) {
    sectionByKey.set(taskMeta.type, {
      id: taskMeta.type,
      task: taskMeta.task,
      name: taskMeta.name,
      primary: taskMeta.primary,
      rows: [],
    });
  }
  return sectionByKey.get(taskMeta.type);
}

function pushRow(taskMeta, row) {
  ensureSection(taskMeta).rows.push(row);
}

for (const m of models) {
  const evals = Array.isArray(m.eval_results) ? m.eval_results : [];
  const langs = modelLangsOf(m);
  let hasWerRow = false;

  for (const e of evals) {
    const taskType = e.task?.type || "other";
    const taskMeta = TASK_SECTIONS.find((t) => t.type === taskType) ?? {
      type: taskType,
      task: "Other",
      name: e.task?.name || taskType,
      primary: null,
    };
    const datasetTokens = [
      e.dataset?.name || e.dataset?.type || null,
      e.dataset?.config ? `(${e.dataset.config})` : null,
      e.dataset?.split ? `· ${e.dataset.split}` : null,
    ].filter(
      (token) =>
        token && !/^unknown$/i.test(String(token).replace(/[()·\s]/g, ""))
    );
    const embeddingDim = embeddingDimOf(e.dataset);
    const datasetDisplay = embeddingDim
      ? null
      : datasetTokens.join(" ") || null;
    const rowLangs = langs.length
      ? langs
      : [DATASET_CONFIG_LANG[e.dataset?.config]].filter(Boolean);

    for (const metric of e.metrics || []) {
      if (metric.value == null) continue;
      if (SKIP_METRIC.test(String(metric.type || "")))
        continue; /* losses & footprint metrics are leaderboard noise */
      if (!metric.type) continue;
      const { value, display } = normalizeMetric(metric.type, metric.value);
      if (value == null) continue;
      const dedupeKey = `${m.id}|${taskType}|${datasetDisplay}|${embeddingDim ?? ""}|${metric.type}|${value.toFixed(2)}`;
      if (rowSeen.has(dedupeKey)) continue;
      rowSeen.add(dedupeKey);
      if (metric.type === "wer") hasWerRow = true;
      pushRow(taskMeta, {
        model: m.name,
        org: orgFromName(m.id),
        projectId: entityIdToProjectId.get(m.id) ?? null,
        languages: rowLangs,
        dataset: datasetDisplay || null,
        embeddingDim,
        evaluationSource: datasetSourceUrl(e.dataset) ?? m.hf_url ?? null,
        evaluationSourceKind: datasetSourceUrl(e.dataset)
          ? "dataset"
          : "model-card",
        metric: String(metric.name || metric.type || "Metric").replace(
          /\s*\(.*\)\s*$/,
          ""
        ),
        metricType: String(metric.type || "").toLowerCase(),
        value,
        display,
        verified: Boolean(metric.verified),
        downloads: m.downloads_monthly ?? 0,
        likes: m.likes ?? 0,
        source: m.hf_url || null,
      });
    }
  }

  /* a reported WER without a structured eval table — only for actual ASR
     models; T5/mT5 translation cards sometimes carry a wer_score by mistake */
  if (m.wer_score != null && !hasWerRow && isAsrModel(m)) {
    const { value, display } = normalizeMetric("wer", m.wer_score);
    pushRow(ASR_META, {
      model: m.name,
      org: orgFromName(m.id),
      projectId: entityIdToProjectId.get(m.id) ?? null,
      languages: langs,
      dataset: null,
      embeddingDim: null,
      evaluationSource: m.hf_url || null,
      evaluationSourceKind: "model-card",
      metric: "WER (reported)",
      metricType: "wer",
      value,
      display,
      verified: false,
      downloads: m.downloads_monthly ?? 0,
      likes: m.likes ?? 0,
      source: m.hf_url || null,
    });
  }
}

/* per section: if the primary metric is well-represented (>= 3 rows),
   show only that metric — comparing WER against CER in one table is noise.
   Sort rows best-first and cap the table. */
const leaderboardSections = [...sectionByKey.values()]
  .map((section) => {
    let rows = section.rows;
    if (section.primary) {
      const primaryRows = rows.filter((r) => r.metricType === section.primary);
      if (primaryRows.length >= 3) rows = primaryRows;
    }
    /* the same model+metric+test-set+value can be scraped twice under
       different org handles; keep the row with the stronger footprint */
    const deduped = new Map();
    for (const row of rows) {
      const key = `${row.model}|${row.metric}|${row.dataset ?? ""}|${row.value}`;
      const previous = deduped.get(key);
      if (!previous || row.downloads > previous.downloads) {
        deduped.set(key, row);
      }
    }
    rows = [...deduped.values()]
      .sort((a, b) => {
        if (a.metricType !== b.metricType)
          return a.metricType.localeCompare(b.metricType);
        if (LOWER_IS_BETTER.test(a.metricType)) return a.value - b.value;
        return b.value - a.value;
      })
      .slice(0, 15);
    const langs = new Set();
    for (const r of rows) for (const l of r.languages) langs.add(l);
    return {
      id: section.id,
      task: section.task,
      name: section.name,
      lowerIsBetter: LOWER_IS_BETTER.test(rows[0]?.metricType ?? ""),
      languages: [...langs].sort(),
      rows,
    };
  })
  .filter((section) => section.rows.length >= 2)
  .sort((a, b) => {
    const priority = (t) =>
      t === "ASR" ? 0 : t === "TTS" ? 1 : t === "Retrieval" ? 2 : 3;
    return priority(a.task) - priority(b.task) || b.rows.length - a.rows.length;
  });

const leaderboard = {
  builtAt: new Date(buildTime).toISOString(),
  sections: leaderboardSections,
};

/* ---------- writes ---------- */
writeFileSync(
  path.join(PUBLIC_DATA, "activity.json"),
  JSON.stringify({
    data: activity,
    builtAt: new Date(buildTime).toISOString(),
  }) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "stats.json"),
  JSON.stringify(stats) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "insights.json"),
  JSON.stringify(insights) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "orgs.json"),
  JSON.stringify({
    data: mergedOrgList,
    builtAt: new Date(buildTime).toISOString(),
  }) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "papers.json"),
  JSON.stringify({
    data: paperRecords,
    builtAt: new Date(buildTime).toISOString(),
  }) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "leaderboard.json"),
  JSON.stringify(leaderboard) + "\n"
);

/* build-time org fixture: static params + sitemap for org profile pages */
writeFileSync(
  path.join(FIXTURES, "orgs.mock.json"),
  JSON.stringify(mergedOrgList, null, 1) + "\n"
);

/* build-time fixtures for language pages (static params + joins) */
const languagesList = CANONICAL_LANGUAGES.map(({ name, slug, glyph }) => ({
  name,
  slug,
  glyph,
}));
writeFileSync(
  path.join(PUBLIC_DATA, "languages.json"),
  JSON.stringify({ data: languagesList }) + "\n"
);
writeFileSync(
  path.join(FIXTURES, "languages.mock.json"),
  JSON.stringify(languagesList, null, 2) + "\n"
);
writeFileSync(
  path.join(FIXTURES, "papers.mock.json"),
  JSON.stringify(paperRecords, null, 2) + "\n"
);

/* ---------- model lineage (family tree) ---------- */
/* Every model card carries base_model, so the ecosystem can be drawn as a
   genealogy: external foundations (Llama, Whisper, w2v-BERT…) branching into
   Ethiopian fine-tunes, and those into further derivations. */
const FAMILY_RULES = [
  [/llama/i, "Llama"],
  [/qwen/i, "Qwen"],
  [/gemma/i, "Gemma"],
  [/mistral|mixtral/i, "Mistral"],
  [/gpt2|gpt-2/i, "GPT-2"],
  [/whisper/i, "Whisper"],
  [/w2v-bert|w2v_bert/i, "w2v-BERT"],
  [/ethio-asr|phoneme-based/i, "Ethio-ASR"],
  [/trocr|\bocr\b/i, "OCR"],
  [/arctic-embed|embed/i, "Embeddings"],
  [/chatterbox/i, "TTS"],
  [/speecht5|vits|omnivoice|xtts|f5-tts|fish|cosyvoice|bark|tacotron/i, "TTS"],
  [/wav2vec|w2v|hubert|data2vec|sec2sec/i, "wav2vec"],
  [/nllb/i, "NLLB"],
  [/t5|mt5/i, "T5"],
  [/mms|seamless/i, "MMS"],
  [/redjackal|vision|vl-base/i, "Vision"],
  [/wan2|i2v|video/i, "Video"],
  [/bert|roberta|xlm-r|afro-xlmr|distilbert|electra/i, "BERT family"],
  [/stable.diffusion|realvis|flux|sdxl/i, "Diffusion"],
  [/gpt|bloom|falcon|phi|deepseek/i, "Other LLM"],
];
const familyOf = (name) => {
  for (const [re, family] of FAMILY_RULES) if (re.test(name)) return family;
  return "Other";
};

const modelById = new Map(models.map((m) => [m.id, m]));
/* base references sometimes omit the org ("Ethio-ASR-multilingual-600M") —
   resolve bare names to the indexed id so roots don't split in two */
const baseNameIndex = new Map();
for (const m of models) {
  const short = String(m.name || m.id).toLowerCase();
  if (!baseNameIndex.has(short)) baseNameIndex.set(short, m.id);
}
const lineageNodes = new Map(); /* id -> node */
const lineageLinks = [];

function lineageNode(id, external) {
  if (!lineageNodes.has(id)) {
    const short = String(id).split("/").pop() || id;
    const indexed = modelById.get(id);
    lineageNodes.set(id, {
      id,
      name: short,
      org: String(id).split("/")[0] || null,
      external: Boolean(external),
      downloads: indexed?.downloads_monthly ?? 0,
      langs: indexed ? modelLangsOf(indexed) : [],
      task: indexed?.type_label ?? indexed?.badge ?? null,
      projectId: entityIdToProjectId.get(id) ?? null,
    });
  }
  return lineageNodes.get(id);
}

for (const m of models) {
  const rawBase = m.base_model
    ? String(m.base_model)
        .replace(/^https?:\/\/huggingface\.co\//, "")
        .trim()
    : null;
  if (!rawBase) continue;
  const base = rawBase.includes("/")
    ? rawBase
    : (baseNameIndex.get(rawBase.toLowerCase()) ?? rawBase);
  lineageNode(m.id, false);
  lineageNode(base, !modelById.has(base));
  lineageLinks.push({ source: base, target: m.id });
}

/* depth = longest path from a root; cycle-safe */
const parentOf = new Map();
for (const link of lineageLinks) parentOf.set(link.target, link.source);
const depthCache = new Map();
function depthOf(id, seen = new Set()) {
  if (depthCache.has(id)) return depthCache.get(id);
  if (seen.has(id)) return 0;
  seen.add(id);
  const parent = parentOf.get(id);
  const depth = parent ? depthOf(parent, seen) + 1 : 0;
  depthCache.set(id, depth);
  return depth;
}

const familyOfNode = (node) => {
  /* walk to the root to name the family */
  let cur = node;
  const seen = new Set();
  while (parentOf.has(cur.id) && !seen.has(cur.id)) {
    seen.add(cur.id);
    cur = lineageNodes.get(parentOf.get(cur.id)) ?? cur;
  }
  return familyOf(cur.name);
};

const nodesWithPos = [...lineageNodes.values()].map((node) => ({
  ...node,
  depth: depthOf(node.id),
  family: familyOfNode(node),
}));

/* deterministic layered layout, grouped into horizontal family bands */
const FAMILY_ORDER = [
  "Llama",
  "Qwen",
  "Gemma",
  "Mistral",
  "GPT-2",
  "Other LLM",
  "BERT family",
  "w2v-BERT",
  "Ethio-ASR",
  "wav2vec",
  "Whisper",
  "TTS",
  "T5",
  "NLLB",
  "MMS",
  "Embeddings",
  "OCR",
  "Vision",
  "Video",
  "Diffusion",
  "Other",
];
const families = [...new Set(nodesWithPos.map((n) => n.family))].sort(
  (a, b) => FAMILY_ORDER.indexOf(a) - FAMILY_ORDER.indexOf(b)
);

const COL_W = 300;
const ROW_H = 72;
const BAND_GAP = 56;
let bandTop = 0;
const familyBands = [];
for (const family of families) {
  const members = nodesWithPos.filter((n) => n.family === family);
  const byDepth = new Map();
  for (const n of members) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth).push(n);
  }
  let maxRows = 1;
  for (const [depth, list] of byDepth) {
    list.sort(
      (a, b) =>
        Number(a.external) - Number(b.external) || b.downloads - a.downloads
    );
    list.forEach((n, i) => {
      n.x = depth * COL_W;
      n.y = bandTop + i * ROW_H;
    });
    maxRows = Math.max(maxRows, list.length);
  }
  const bandHeight = maxRows * ROW_H;
  familyBands.push({
    family,
    top: bandTop,
    height: bandHeight,
    count: members.length,
    models: members.filter((n) => !n.external).length,
  });
  bandTop += bandHeight + BAND_GAP;
}

const lineage = {
  nodes: nodesWithPos.map((n) => ({
    id: n.id,
    name: n.name,
    org: n.org,
    external: n.external,
    downloads: n.downloads,
    langs: n.langs,
    task: n.task,
    projectId: n.projectId,
    family: n.family,
    x: n.x,
    y: n.y,
  })),
  links: lineageLinks,
  families: familyBands,
  stats: {
    models: nodesWithPos.filter((n) => !n.external).length,
    foundations: nodesWithPos.filter((n) => n.external).length,
    families: familyBands.length,
  },
  builtAt: new Date(buildTime).toISOString(),
};

/* ---------- charts: growth history (from daily snapshots) ---------- */
const SNAPSHOTS_DIR = path.join(ROOT, "data", "snapshots");
const growth = [];
if (existsSync(SNAPSHOTS_DIR)) {
  const snapshotFiles = readdirSync(SNAPSHOTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
  for (const file of snapshotFiles) {
    try {
      const snap = JSON.parse(
        readFileSync(path.join(SNAPSHOTS_DIR, file), "utf8")
      );
      const snapModels = Array.isArray(snap.models) ? snap.models : [];
      const snapDatasets = Array.isArray(snap.datasets) ? snap.datasets : [];
      growth.push({
        date: snap.date ?? file.replace(/\.json$/, ""),
        models: snapModels.length,
        datasets: snapDatasets.length,
        downloads: snapModels.reduce(
          (sum, m) => sum + (m.downloads ?? m.downloads_monthly ?? 0),
          0
        ),
      });
    } catch {
      /* skip malformed snapshots */
    }
  }
}

/* ---------- charts: top models download history ---------- */
const modelSnapshots = existsSync(DATA("model_snapshots.json"))
  ? JSON.parse(readFileSync(DATA("model_snapshots.json"), "utf8"))
  : {};
const TOP_MODEL_COUNT = 5;
const topModels = [...models]
  .sort((a, b) => (b.downloads_monthly ?? 0) - (a.downloads_monthly ?? 0))
  .filter((m) => modelSnapshots[m.id])
  .slice(0, TOP_MODEL_COUNT);

const dateSet = new Set();
for (const m of topModels)
  for (const d of modelSnapshots[m.id].dates ?? []) dateSet.add(d);
const topModelHistory = [...dateSet].sort().map((date) => {
  const row = { date };
  for (const m of topModels) {
    const snap = modelSnapshots[m.id];
    const i = (snap.dates ?? []).indexOf(date);
    row[m.id] = i >= 0 ? ((snap.downloads ?? [])[i] ?? null) : null;
  }
  return row;
});

/* ---------- charts: language × task coverage (radar) ---------- */
/* The radar is derived from the same normalized Project fixtures as /lang and
   the gap report, so a language total here cannot drift from a language page. */
const RADAR_LANGS = CANONICAL_LANGUAGES.map((language) => language.name);
const RADAR_TASKS = ["ASR", "TTS", "Translation", "LLM", "NER", "Embeddings"];

function languagesOfProject(project) {
  const raw = project.repositoryDetails?.languages;
  const declared = Array.isArray(raw) ? raw : Object.keys(raw ?? {});
  const stacks = (project.projectTechStacks ?? [])
    .filter((stack) => stack.type === "LANGUAGE")
    .map((stack) => stack.name);
  return new Set([...declared, ...stacks]);
}

function taskOfProject(project) {
  const categories = (project.projectCategories ?? []).map((c) => c.name);
  if (categories.includes("Model")) {
    const task = RADAR_TASKS.find((name) => categories.includes(name));
    return task ?? "Other";
  }
  if (!categories.includes("Dataset")) return null;
  const tags = (project.repositoryDetails?.tags ?? []).map((t) =>
    String(t).toLowerCase()
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

const languageAssets = projects.filter((project) => {
  const categories = (project.projectCategories ?? []).map((c) => c.name);
  return categories.includes("Model") || categories.includes("Dataset");
});

const radarRows = RADAR_TASKS.map((task) => {
  const row = { task };
  for (const lang of RADAR_LANGS) {
    row[lang] = languageAssets.filter(
      (project) =>
        languagesOfProject(project).has(lang) && taskOfProject(project) === task
    ).length;
  }
  return row;
});

/* chart data (fetched client-side) */
writeFileSync(
  path.join(PUBLIC_DATA, "growth.json"),
  JSON.stringify({ data: growth, builtAt: new Date(buildTime).toISOString() }) +
    "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "lineage.json"),
  JSON.stringify(lineage) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "top-models-history.json"),
  JSON.stringify({
    rows: topModelHistory,
    series: topModels.map((m) => ({
      id: m.id,
      name: m.name,
      org: orgFromName(m.id),
      projectId: entityIdToProjectId.get(m.id) ?? null,
      dl: m.downloads_monthly ?? 0,
    })),
    builtAt: new Date(buildTime).toISOString(),
  }) + "\n"
);
writeFileSync(
  path.join(PUBLIC_DATA, "language-coverage.json"),
  JSON.stringify({
    rows: radarRows,
    languages: RADAR_LANGS,
    tasks: RADAR_TASKS,
  }) + "\n"
);

/* regenerate taxonomy.mock.ts with goha's categories + languages */
const techStackLines = techStacks.map((t) => {
  const args = [
    JSON.stringify(t.id),
    JSON.stringify(t.name),
    JSON.stringify(t.iconUrl),
    JSON.stringify(t.type),
  ];
  const oneLine = `  tech(${args.join(", ")}),`;
  if (oneLine.length <= 80) return oneLine;
  return `  tech(\n${args.map((arg) => `    ${arg}`).join(",\n")}\n  ),`;
});

const taxTs = `import type { CategoryType } from "@/shared/types/category.type";
import type { TechStackType } from "@/shared/types/tech-stack.type";

import { mockPublicId } from "@/mocks/public-id.mock";

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
      `  { id: mockPublicId("cat", ${categories.indexOf(c) + 1}), name: ${JSON.stringify(c.name)} },`
  )
  .join("\n")}
];

export const techStacks: TechStackType[] = [
${techStackLines.join("\n")}
];
`;
writeFileSync(path.join(FIXTURES, "taxonomy.mock.ts"), taxTs);

console.log(
  `✓ goha fixtures built:
    projects: ${projects.length} (models ${models.length} · datasets ${datasets.length} · companies ${companies.length} · papers ${papers.length})
    categories: ${categories.length} · techStacks: ${techStacks.length}
    languages: ${languagesList.map((language) => language.name).join(", ")}
    stacks: ${topStacks.map((s) => s.name).join(", ")}
    ecosystem: activity ${activity.length} · orgs ${mergedOrgList.length} · papers ${paperRecords.length} · leaderboard sections ${leaderboardSections.length}
    charts: growth ${growth.length} days · top models ${topModelHistory.length} days · radar tasks ${radarRows.length}
    lineage: ${lineage.stats.models} models · ${lineage.stats.foundations} foundations · ${lineage.stats.families} families`
);
