import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const SNAPSHOT_DIR = join(DATA_DIR, "snapshots");

/* ─── Read JSON helper ─── */
function readJSON(filepath) {
  if (!existsSync(filepath)) return null;
  try { return JSON.parse(readFileSync(filepath, "utf-8")); } catch { return null; }
}

/* ─── Type inference ─── */
function inferType(pipelineTag = '', tags = [], modelId = '') {
  const all = [pipelineTag, ...tags, modelId].map(t => (t || '').toLowerCase());
  const has = (...terms) => terms.some(t => all.some(s => new RegExp(`(?:^|[\\-_/])${t}(?:[\\-_/]|$)`).test(s)));
  if (has('automatic-speech-recognition', 'asr', 'speech-recognition')) return 'ASR';
  if (has('text-to-speech', 'tts')) return 'TTS';
  if (has('translation', 'nmt', 'machine-translation')) return 'Translation';
  if (has('text-generation', 'causal-lm', 'language-model')) return 'LLM';
  if (has('token-classification', 'ner', 'named-entity')) return 'NER';
  if (has('feature-extraction', 'sentence-similarity', 'embedding', 'reranker')) return 'Embeddings';
  if (has('fill-mask', 'masked-lm')) return 'Masked LM';
  if (has('text-classification', 'sentiment')) return 'Classification';
  if (has('image-classification', 'object-detection', 'vision')) return 'Vision';
  if (has('stable-diffusion', 'diffusion', 'lora', 'flux')) return 'Image Generation';
  if (has('question-answering')) return 'QA';
  if (has('summarization')) return 'Summarization';
  return 'NLP';
}

function mapTypeToBadge(type) {
  const MAP = {
    'ASR': { badge: 'ASR', bc: 'b-asr' },
    'TTS': { badge: 'TTS', bc: 'b-asr' },
    'Translation': { badge: 'Translation', bc: 'b-nmt' },
    'LLM': { badge: 'LLM', bc: 'b-llm' },
    'NER': { badge: 'NER', bc: 'b-ner' },
    'Embeddings': { badge: 'Embeddings', bc: 'b-emb' },
    'Masked LM': { badge: 'Masked LM', bc: 'b-default' },
    'Classification': { badge: 'Classification', bc: 'b-default' },
    'Vision': { badge: 'Vision', bc: 'b-default' },
    'Image Generation': { badge: 'Image Gen', bc: 'b-default' },
    'QA': { badge: 'QA', bc: 'b-default' },
    'Summarization': { badge: 'Summarization', bc: 'b-default' },
    'NLP': { badge: 'Model', bc: 'b-default' },
  };
  return MAP[type] || { badge: 'Model', bc: 'b-default' };
}

function inferBadge(raw) {
  if (raw.type_label) return mapTypeToBadge(raw.type_label);
  const type = inferType(raw.pipeline_tag, raw.tags, raw.id || raw.name);
  return mapTypeToBadge(type);
}

const LANG_MAP = {
  amharic: "AM", oromo: "OM", "afaan oromo": "OM", tigrinya: "TI",
  geez: "GZ", somali: "SO", afar: "AA", sidama: "SID",
  english: "EN",
};

function codeLang(raw) {
  return LANG_MAP[raw?.toLowerCase()] || raw?.toUpperCase()?.slice(0, 2) || null;
}

function extractLang(rawLangs, tags) {
  const langs = (rawLangs || []).map((l) => l.trim().toLowerCase()).filter(Boolean);
  if (!langs.length) {
    for (const t of tags || []) {
      const m = t.match(/^language:(.+)/);
      if (m) {
        const name = m[1].trim().toLowerCase();
        const code = codeLang(name);
        if (code) langs.push(code);
      }
    }
  }
  const codes = langs.map(codeLang).filter(Boolean);
  const unique = [...new Set(codes)];
  return {
    langs: unique,
    lang: unique.length === 1 ? unique[0] : (unique.length > 1 ? unique.join("\u00B7") : null),
  };
}

/* ─── Normalize ─── */
function normalizeModel(raw) {
  const { badge, bc } = inferBadge(raw);
  const { lang, langs } = extractLang(raw.languages, raw.tags);
  return {
    ...raw,
    _type: "model",
    org: raw.author_name || raw.author_hf || raw.author || "",
    badge, bc,
    dl: raw.downloads_monthly ?? 0,
    lang, langs,
    isNew: !!raw.is_new,
    desc: raw.description || "",
    downloads_monthly: raw.downloads_monthly ?? 0,
    likes: raw.likes ?? 0,
    featured: (raw.likes || 0) > 20,
    verified: true,
    is_new: undefined, languages: undefined,
    author_name: undefined, author_hf: undefined, author: undefined,
  };
}

function normalizeDataset(raw) {
  const { lang, langs } = extractLang(raw.languages, raw.tags);
  return {
    ...raw, _type: "dataset",
    org: raw.author_name || raw.author_hf || "",
    badge: "Dataset", bc: "b-ds",
    hf_url: raw.id ? `https://huggingface.co/datasets/${raw.id}` : raw.hf_url,
    dl: raw.downloads_monthly ?? 0, lang, langs,
    isNew: !!raw.is_new, desc: raw.description || "",
    downloads_monthly: raw.downloads_monthly ?? 0,
    likes: raw.likes ?? 0, featured: (raw.likes || 0) > 10,
    verified: true,
    is_new: undefined, languages: undefined,
    author_name: undefined, author_hf: undefined,
  };
}

function normalizePaper(raw) {
  return {
    ...raw, _type: "paper",
    name: raw.title || raw.name || "",
    org: (raw.authors || []).join(", ") || raw.org || "",
    badge: "Paper", bc: "b-paper",
    desc: raw.abstract || raw.desc || "",
    dl: null, lang: null, langs: [],
    isNew: false, tags: raw.categories || [],
    downloads_monthly: 0, likes: 0,
    featured: false, verified: false,
  };
}

function normalizeCompany(raw) {
  return {
    ...raw, _type: "company",
    org: raw.hq || raw.org || "",
    badge: "Company", bc: "b-co",
    dl: null, lang: null, langs: raw.langs || [],
    isNew: !!raw.is_new || !!raw.isNew,
    desc: raw.desc || raw.description || "",
    tags: raw.tags || [],
    website: raw.website || "", github: raw.github || "",
    hf_org: raw.hf_org || "", founded: raw.founded || "",
    models: Array.isArray(raw.models) ? raw.models : [],
    models_count: 0, related_models: [],
    downloads_monthly: 0, likes: 0,
    featured: !!raw.featured, verified: !!raw.verified,
  };
}

function normalizeSpace(raw) {
  return {
    ...raw, _type: "space",
    org: raw.author || "",
    badge: "Space", bc: "b-space",
    dl: null, lang: null, langs: [],
    isNew: false, desc: "",
    tags: [raw.sdk || ""].filter(Boolean),
    downloads_monthly: 0, likes: raw.likes ?? 0,
    featured: false, verified: false,
  };
}

function normalizeRepo(raw) {
  return {
    ...raw, _type: "repo",
    name: raw.full_name || raw.name || "",
    org: raw.owner || "",
    badge: "Repo", bc: "b-repo",
    dl: null, lang: null, langs: [],
    isNew: false, desc: raw.description || "",
    tags: raw.topics || [],
    downloads_monthly: 0, likes: raw.stars ?? 0,
    featured: false, verified: false,
    added_at: raw.last_commit || null,
  };
}

/* ─── Time helpers ─── */
function timeAgo(dateString) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return "just now";
}

function normalizeFeedEntry(raw) {
  const FEED_ICONS = { new_model: "new_model", new_dataset: "new_dataset", new_paper: "new_paper", trending: "trending", milestone: "milestone" };
  return {
    id: raw.id, type: raw.type,
    icon: FEED_ICONS[raw.type] || "new",
    message: raw.title || "",
    ago: timeAgo(raw.created_at),
    title: raw.title, description: raw.description,
    entity_id: raw.entity_id, entity_type: raw.entity_type,
    created_at: raw.created_at, metadata: raw.metadata || {},
  };
}

/* ─── Growth computation ─── */
function getGrowth(modelId, snapshots) {
  if (snapshots.length < 2) return null;
  const oldest = snapshots[0].models?.find((m) => m.id === modelId);
  const newest = snapshots[snapshots.length - 1].models?.find((m) => m.id === modelId);
  if (!oldest || !newest) return null;
  if (oldest.downloads === 0) return null;
  if (newest.downloads < 50) return null;
  const growth = ((newest.downloads - oldest.downloads) / oldest.downloads) * 100;
  if (Math.abs(growth) < 5) return null;
  return Math.round(growth);
}

function getSparkline(id, snapshots) {
  if (!id || !snapshots.length) return null;
  const points = [];
  const timestamps = [];
  for (const snap of snapshots) {
    const entry = snap.models?.find((m) => m.id === id);
    if (entry) { points.push(entry.downloads); timestamps.push(snap.date || null); }
  }
  if (points.length < 2) return null;
  return { points, timestamps };
}

/* ─── Trending ─── */
function computeTrending(normalizedModels, snapshots) {
  const withGrowth = [...normalizedModels]
    .filter((m) => m.dl >= 50)
    .map((m) => ({ name: m.name, org: m.org, badge: m.badge, growth: getGrowth(m.id, snapshots), dl: m.dl, lang: m.lang, desc: m.desc, id: m.id, isNew: !!m.isNew, added_at: m.added_at }))
    .filter((m) => m.growth !== null)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 6);
  if (withGrowth.length >= 3) return { items: withGrowth, label: "Trending This Week" };
  const topByDl = [...normalizedModels]
    .filter((m) => m.dl >= 50)
    .sort((a, b) => (b.dl || 0) - (a.dl || 0))
    .slice(0, 6)
    .map((m) => ({ name: m.name, org: m.org, badge: m.badge, growth: null, dl: m.dl, lang: m.lang, desc: m.desc, id: m.id, isNew: !!m.isNew, added_at: m.added_at }));
  return { items: topByDl, label: "Most Downloaded" };
}

/* ─── Verdicts ─── */
function computeVerdicts(allModels, allDatasets) {
  const all = [...allModels, ...allDatasets];
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const bestByBadge = {};
  for (const m of all) {
    if (m.dl != null && m.dl >= 200) {
      const badge = m.badge || "Model";
      if (!bestByBadge[badge] || m.dl > bestByBadge[badge].dl) bestByBadge[badge] = m;
    }
  }
  let maxGrowth = -Infinity;
  for (const m of all) {
    if (m.growth != null && m.growth > maxGrowth && m.dl != null && m.dl > 0) maxGrowth = m.growth;
  }
  for (const m of all) {
    const isRecent = m.isNew || (m.added_at && (now - new Date(m.added_at).getTime()) < SEVEN_DAYS);
    if (isRecent && m.dl != null && m.dl > 0) {
      m.verdict = { label: "New", icon: "new", type: "new" };
    } else if (bestByBadge[m.badge] && bestByBadge[m.badge] === m) {
      m.verdict = { label: `Best ${m.badge}`, icon: "best", type: "best" };
    } else if (m.growth != null && m.growth === maxGrowth && maxGrowth > 15 && m.dl != null && m.dl > 0) {
      m.verdict = { label: "Fastest growing", icon: "growing", type: "growing" };
    } else if (m.likes != null && m.likes > 0 && m.dl != null && m.dl > 0 && (m.likes / m.dl) > 0.03 && m.dl < 500) {
      m.verdict = { label: "Underrated", icon: "underrated", type: "underrated" };
    }
  }
}

/* ─── Quickstart ─── */
function computeQuickstart(normalizedModels, normalizedDatasets) {
  const all = [...normalizedModels, ...normalizedDatasets];
  const guides = [];
  const amharicEmbed = all.filter(m => (m.badge === "Embed" || m.badge === "Model") && (m.langs || []).includes("AM")).sort((a, b) => (b.dl || 0) - (a.dl || 0)).slice(0, 3);
  if (amharicEmbed.length) guides.push({ id: "amharic-embed", title: "Building for Amharic?", description: "Start with embeddings \u2014 the foundation for search, classification, and more.", items: amharicEmbed.map(m => ({ name: m.name, org: m.org, badge: m.badge, bc: m.bc, dl: m.dl, lang: m.lang, verdict: m.verdict })) });
  const asrModels = all.filter(m => m.badge === "ASR").sort((a, b) => (b.dl || 0) - (a.dl || 0)).slice(0, 3);
  if (asrModels.length) guides.push({ id: "speech-to-text", title: "Need speech-to-text?", description: "Production-ready ASR models for Amharic, Oromo, Tigrinya and more.", items: asrModels.map(m => ({ name: m.name, org: m.org, badge: m.badge, bc: m.bc, dl: m.dl, lang: m.lang, verdict: m.verdict })) });
  const topAll = [...normalizedModels].filter(m => m.dl != null).sort((a, b) => (b.dl || 0) - (a.dl || 0)).slice(0, 3);
  if (topAll.length) guides.push({ id: "top-downloads", title: "New to Ethiopian AI?", description: "The models with the most community traction \u2014 start here.", items: topAll.map(m => ({ name: m.name, org: m.org, badge: m.badge, bc: m.bc, dl: m.dl, lang: m.lang, verdict: m.verdict })) });
  return { guides };
}

/* ─── Build ─── */
function build() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   goha.et — Build                     ║");
  console.log("╚══════════════════════════════════════╝\n");

  if (!existsSync(DATA_DIR)) { console.error("data/ directory not found"); process.exit(1); }

  const raw = readJSON(join(DATA_DIR, "db.json"));
  if (!raw) { console.error("data/db.json not found"); process.exit(1); }

  /* Normalize all entities */
  const normalizedModels = (raw.models || []).map(normalizeModel);
  const normalizedDatasets = (raw.datasets || []).map(normalizeDataset);
  const normalizedSpaces = (raw.spaces || []).map(normalizeSpace);
  const normalizedRepos = (raw.github_repos || []).map(normalizeRepo);
  const normalizedPapers = (raw.papers || []).map(normalizePaper);
  const normalizedCompanies = (raw.companies || []).map(normalizeCompany);

  console.log(`  Raw:    ${raw.models?.length || 0} models, ${raw.datasets?.length || 0} datasets, ${raw.papers?.length || 0} papers`);

  /* Attach related models to companies */
  const hfSlug = (url) => { if (!url) return ""; const m = String(url).match(/huggingface\.co\/([^/?#]+)/i); return m ? m[1].toLowerCase() : ""; };
  for (const c of normalizedCompanies) {
    const needles = new Set();
    const slug = hfSlug(c.hf_org); if (slug) needles.add(slug);
    if (c.name) needles.add(c.name.toLowerCase().replace(/\s+/g, "-"));
    if (c.name) needles.add(c.name.toLowerCase());
    const matched = normalizedModels.filter((m) => {
      const a = String(m.author_hf || "").toLowerCase();
      const o = String(m.org || "").toLowerCase();
      if (!a && !o) return false;
      for (const n of needles) { if (!n) continue; if (a === n || a.startsWith(n + "/") || a.includes("/" + n)) return true; if (o === n.replace(/-/g, " ") || o.includes(n.replace(/-/g, " "))) return true; }
      return false;
    });
    c.related_models = matched.map((m) => m.id || m.name);
    c.models_count = matched.length;
    if (!c.models || !c.models.length) c.models = c.related_models;
  }

  /* Load snapshots */
  const snapshots = [];
  if (existsSync(SNAPSHOT_DIR)) {
    const files = readdirSync(SNAPSHOT_DIR).filter((f) => f.endsWith(".json")).sort().slice(-7);
    for (const f of files) {
      const s = readJSON(join(SNAPSHOT_DIR, f));
      if (s) snapshots.push(s);
    }
  }
  console.log(`  Snapshots: ${snapshots.length} files`);

  /* Attach growth + sparkline */
  for (const m of normalizedModels) { if (m.id) { m.growth = getGrowth(m.id, snapshots); m.sparkline = getSparkline(m.id, snapshots); } }
  for (const d of normalizedDatasets) { if (d.id) { d.growth = getGrowth(d.id, snapshots); d.sparkline = getSparkline(d.id, snapshots); } }

  /* Cleanup: filter GGUF, orphaned papers */
  let before = normalizedModels.length;
  const cleanedModels = normalizedModels.filter((m) => { const id = (m.id || '').toLowerCase(); const tags = (m.tags || []).map(t => t.toLowerCase()); return !(id.includes('gguf') || tags.includes('gguf')); });
  console.log(`  GGUF filter: ${before} -> ${cleanedModels.length} models`);
  before = normalizedDatasets.length;
  const cleanedDatasets = normalizedDatasets.filter((d) => { const id = (d.id || '').toLowerCase(); const tags = (d.tags || []).map(t => t.toLowerCase()); return !(id.includes('gguf') || tags.includes('gguf')); });
  console.log(`  GGUF filter: ${before} -> ${cleanedDatasets.length} datasets`);
  const ethKeywords = ['amharic', 'tigrinya', 'oromo', 'ethiopian', 'geez'];
  const cleanedPapers = normalizedPapers.filter((p) => { const title = (p.title || '').toLowerCase(); const abst = (p.abstract || p.desc || '').toLowerCase(); return ethKeywords.some(kw => title.includes(kw) || abst.includes(kw)); });

  /* Verdicts */
  computeVerdicts(cleanedModels, cleanedDatasets);

  /* Trending */
  const trending = computeTrending(cleanedModels, snapshots);

  /* Quickstart */
  const quickstart = computeQuickstart(cleanedModels, cleanedDatasets);

  /* Stats */
  const topModel = [...cleanedModels].sort((a, b) => (b.dl || 0) - (a.dl || 0))[0];
  const stats = {
    models: cleanedModels.length,
    datasets: cleanedDatasets.length,
    papers: cleanedPapers.length,
    research: cleanedPapers.length,
    companies: normalizedCompanies.length,
    spaces: normalizedSpaces.length,
    repos: normalizedRepos.length,
    languages: 6,
    indexed: raw.meta?.last_updated ? timeAgo(raw.meta.last_updated) : "just now",
    featured: topModel ? { downloads: topModel.dl || 0, name: topModel.name, lang: (topModel.lang || topModel.langs?.[0] || "") } : { downloads: 0, name: "", lang: "" },
  };

  /* MX (max downloads across models + datasets) */
  const allDls = [...cleanedModels, ...cleanedDatasets].map((d) => d.dl).filter(Boolean);
  const MX = allDls.length ? Math.max(...allDls, 100) : 2341;

  /* Activity feed */
  const rawFeed = readJSON(join(DATA_DIR, "activity_feed.json"));
  const activityFeed = rawFeed ? rawFeed.map(normalizeFeedEntry) : [];

  /* Build the final db.json (full normalized data) */
  const output = {
    meta: raw.meta || { last_updated: new Date().toISOString() },
    stats,
    MX,
    models: cleanedModels,
    datasets: cleanedDatasets,
    papers: cleanedPapers,
    companies: normalizedCompanies,
    spaces: normalizedSpaces,
    repos: normalizedRepos,
    activity_feed: activityFeed,
    trending,
    quickstart: quickstart,
  };

  /* Write individual files for frontend */
  const writeJSON = (name, data) => writeFileSync(join(DATA_DIR, name), JSON.stringify(data, null, 2));

  writeJSON("build-db.json", output);
  writeJSON("stats.json", { data: stats, total: 1, page: 1, limit: 1 });
  writeJSON("models.json", { data: cleanedModels, total: cleanedModels.length, page: 1, limit: cleanedModels.length });
  writeJSON("datasets.json", { data: cleanedDatasets, total: cleanedDatasets.length, page: 1, limit: cleanedDatasets.length });
  writeJSON("papers.json", { data: cleanedPapers, total: cleanedPapers.length, page: 1, limit: cleanedPapers.length });
  writeJSON("companies.json", { data: normalizedCompanies, total: normalizedCompanies.length, page: 1, limit: normalizedCompanies.length });
  writeJSON("trending.json", trending);
  writeJSON("quickstart.json", quickstart);
  writeJSON("activity_feed.json", activityFeed);

  console.log(`\n  Built:`);
  console.log(`  Models:       ${cleanedModels.length}`);
  console.log(`  Datasets:     ${cleanedDatasets.length}`);
  console.log(`  Papers:       ${cleanedPapers.length}`);
  console.log(`  Companies:    ${normalizedCompanies.length}`);
  console.log(`  Spaces:       ${normalizedSpaces.length}`);
  console.log(`  Repos:        ${normalizedRepos.length}`);
  console.log(`  Feed:         ${activityFeed.length}`);
  console.log(`  MX (max dl):  ${MX}`);
  console.log(`\n  Written: build-db.json, stats.json, models.json, datasets.json, papers.json, companies.json, trending.json, quickstart.json, activity_feed.json`);
}

build();
