import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const SEARCH_TERMS = ["amharic", "oromo", "tigrinya", "geez", "ethiopian", "ethiopia"];
const GH_ORGS = ["EthioNLP", "iCogLabs", "hasab-ai"];
const HF_API = "https://huggingface.co/api";
const GH_API = "https://api.github.com";
const ARXIV_API = "http://export.arxiv.org/api/query";
const DATA_DIR = join(__dirname, "..", "data");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(url, retries = 3, extraHeaders = {}) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "goha-et-scraper/1.0", ...extraHeaders },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(2000 * (i + 1));
    }
  }
}

async function fetchJSON(url, retries = 3, extraHeaders = {}) {
  const text = await fetchPage(url, retries, extraHeaders);
  return JSON.parse(text);
}

const hfHeaders = process.env.HF_TOKEN ? { Authorization: `Bearer ${process.env.HF_TOKEN}` } : {};
const ghHeaders = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};

function fetchHF(url, retries) { return fetchJSON(url, retries, hfHeaders); }
function fetchHFPage(url, retries) { return fetchPage(url, retries, hfHeaders); }
function fetchGH(url, retries) { return fetchJSON(url, retries, ghHeaders); }

/* ─── Type inference ─── */

function inferType(pipelineTag = '', tags = [], modelId = '') {
  const all = [pipelineTag, ...tags, modelId].map(t => (t || '').toLowerCase())
  const has = (...terms) => terms.some(t => all.some(s => new RegExp(`(?:^|[\\-_/])${t}(?:[\\-_/]|$)`).test(s)))

  if (has('automatic-speech-recognition', 'asr', 'speech-recognition')) return 'ASR'
  if (has('text-to-speech', 'tts')) return 'TTS'
  if (has('translation', 'nmt', 'machine-translation')) return 'Translation'
  if (has('text-generation', 'causal-lm', 'language-model')) return 'LLM'
  if (has('token-classification', 'ner', 'named-entity')) return 'NER'
  if (has('feature-extraction', 'sentence-similarity', 'embedding', 'reranker')) return 'Embeddings'
  if (has('fill-mask', 'masked-lm')) return 'Masked LM'
  if (has('text-classification', 'sentiment')) return 'Classification'
  if (has('image-classification', 'object-detection', 'vision')) return 'Vision'
  if (has('stable-diffusion', 'diffusion', 'lora', 'flux')) return 'Image Generation'
  if (has('question-answering')) return 'QA'
  if (has('summarization')) return 'Summarization'
  return 'NLP'
}

/* ─── Helpers ─── */

function deduplicate(arr) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = item.id ?? item.full_name ?? item.arxiv_id ?? item.name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* ─── HuggingFace ─── */

function mapModel(raw, type) {
  const id = raw.id || raw.modelId || "";
  const tags = raw.tags || [];
  return {
    id,
    name: raw.id?.split("/")[1] || raw.id || "",
    type,
    pipeline_tag: raw.pipeline_tag || null,
    type_label: inferType(raw.pipeline_tag, tags, raw.id),
    languages: Array.isArray(raw.language) ? raw.language : raw.language ? [raw.language] : [],
    author_name: raw.author || raw.user?.fullname || "",
    author_hf: raw.author || "",
    hf_url: type === "dataset" ? `https://huggingface.co/datasets/${id}` : `https://huggingface.co/${id}`,
    downloads_monthly: raw.downloads || 0,
    likes: raw.likes || 0,
    last_updated: raw.lastModified || raw.updatedAt || null,
    tags,
    description: raw.description || raw.cardData?.license || "",
    is_new: false,
    added_at: new Date().toISOString(),
  };
}

async function searchHuggingFace(term, type) {
  const endpoint = type === "spaces" ? "/spaces" : `/${type}`;
  const url = `${HF_API}${endpoint}?search=${encodeURIComponent(term)}&limit=50&full=true&sort=downloads`;
  const data = await fetchHF(url);
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapModel(item, type === "spaces" ? "space" : "model"));
}

async function searchDatasets(term) {
  const url = `${HF_API}/datasets?search=${encodeURIComponent(term)}&limit=50&full=true&sort=downloads`;
  const data = await fetchHF(url);
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapModel(item, "dataset"));
}

async function searchSpaces(term) {
  const url = `${HF_API}/spaces?search=${encodeURIComponent(term)}&limit=50&sort=likes`;
  const data = await fetchHF(url);
  if (!Array.isArray(data)) return [];
  return data.map((item) => ({
    id: item.id || item.modelId || "",
    name: item.id?.split("/")[1] || item.id || "",
    author: item.author || "",
    url: `https://huggingface.co/spaces/${item.id}`,
    likes: item.likes || 0,
    sdk: item.sdk || "",
    last_updated: item.lastModified || null,
  }));
}

async function enrichModelDetails(model) {
  const modelId = model.id;
  if (!modelId) return model;

  console.log(`    Fetching details for model: ${modelId}`);

  let license = null;
  let base_model = null;
  let eval_results = null;
  let param_count = null;
  let training_datasets = [];
  let confirmed_languages = [];
  let file_count = null;
  let wer_score = null;

  // 1. Fetch full model info
  try {
    const infoUrl = `${HF_API}/models/${modelId}`;
    const info = await fetchHF(infoUrl);

    // Extract license
    const rawLicense = info.cardData?.license;
    if (typeof rawLicense === "string") {
      license = rawLicense;
    } else if (rawLicense) {
      license = String(rawLicense);
    }

    // Extract base model
    let rawBaseModel = info.cardData?.base_model;
    if (Array.isArray(rawBaseModel)) {
      rawBaseModel = rawBaseModel[0];
    }
    if (rawBaseModel) {
      base_model = String(rawBaseModel);
    }

    // Extract eval_results
    eval_results = info.cardData?.["model-index"]?.[0]?.results || null;

    // Extract param_count
    const rawParam = info.safetensors?.total || info.config?.num_parameters;
    if (rawParam !== undefined && rawParam !== null) {
      param_count = Number(rawParam);
    }

    // Extract training_datasets
    let rawDatasets = info.cardData?.datasets;
    if (typeof rawDatasets === "string") {
      training_datasets = [rawDatasets];
    } else if (Array.isArray(rawDatasets)) {
      training_datasets = rawDatasets.map(String);
    }

    // Extract confirmed_languages
    let rawLanguages = info.cardData?.language;
    if (typeof rawLanguages === "string") {
      confirmed_languages = [rawLanguages];
    } else if (Array.isArray(rawLanguages)) {
      confirmed_languages = rawLanguages.map(String);
    }

    // Extract file_count
    if (Array.isArray(info.siblings)) {
      file_count = info.siblings.length;
    }
  } catch (err) {
    console.error(`    [ERROR] Fetching HF model info for ${modelId}: ${err.message}`);
  }

  // 2. Fetch README
  try {
    const readmeUrl = `https://huggingface.co/${modelId}/raw/main/README.md`;
    const readmeText = await fetchHFPage(readmeUrl);
    if (readmeText) {
      const match1 = readmeText.match(/Word Error Rate[:\s]+([0-9.]+%?)/i);
      if (match1) {
        wer_score = match1[1];
      } else {
        const match2 = readmeText.match(/WER[:\s]+([0-9.]+%?)/i);
        if (match2) {
          wer_score = match2[1];
        }
      }
    }
  } catch (err) {
    // README might not exist, skip silently
  }

  return {
    ...model,
    license,
    base_model,
    eval_results,
    param_count,
    training_datasets,
    confirmed_languages,
    file_count,
    wer_score,
  };
}

/* ─── GitHub ─── */

const GH_SEARCHES = [
  "amharic+language:python",
  "tigrinya+language:python",
  "ethiopian-nlp",
  "amharic+NLP",
];

async function searchGitHubRepos(query) {
  const url = `${GH_API}/search/repositories?q=${query}&sort=stars&per_page=30`;
  const data = await fetchGH(url);
  if (!data.items) return [];
  return data.items.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description || "",
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    open_issues: r.open_issues_count || 0,
    last_commit: r.pushed_at || null,
    url: r.html_url,
    owner: r.owner?.login || "",
    owner_avatar: r.owner?.avatar_url || "",
    topics: r.topics || [],
    language: r.language || "",
  }));
}

async function fetchOrgRepos(org) {
  let page = 1;
  const allRepos = [];
  while (page <= 3) {
    const url = `${GH_API}/orgs/${org}/repos?sort=pushed&per_page=30&page=${page}`;
    const data = await fetchGH(url);
    if (!Array.isArray(data) || data.length === 0) break;
    allRepos.push(...data);
    page++;
    await sleep(500);
  }
  return allRepos.map((r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description || "",
    stars: r.stargazers_count || 0,
    forks: r.forks_count || 0,
    open_issues: r.open_issues_count || 0,
    last_commit: r.pushed_at || null,
    url: r.html_url,
    owner: r.owner?.login || "",
    owner_avatar: r.owner?.avatar_url || "",
    topics: r.topics || [],
    language: r.language || "",
    org: org,
  }));
}

/* ─── arXiv ─── */

const ARXIV_QUERIES = [
  'ti:amharic',
  'ti:tigrinya',
  'ti:"afaan oromo"',
  'ti:"ge\'ez"',
  'abs:amharic+AND+abs:speech',
  'abs:amharic+AND+abs:translation',
  'abs:amharic+AND+abs:"language model"',
  'abs:tigrinya+AND+abs:NLP',
  'abs:"low-resource"+AND+abs:amharic',
  'abs:"ethiopian language"',
  'abs:"ethiopian nlp"',
];

function isRelevantPaper(title, abstract) {
  const keywords = ['amharic', 'tigrinya', 'oromo', 'ethiopian', "ge'ez", 'geez', 'afaan'];
  const text = `${title} ${abstract}`.toLowerCase();
  return keywords.some(kw => text.includes(kw));
}

async function searchArxiv() {
  const { XMLParser } = await import('fast-xml-parser');
  const parser = new XMLParser({ ignoreAttributes: false });
  const allPapers = [];
  const seen = new Set();

  for (const query of ARXIV_QUERIES) {
    const url = `${ARXIV_API}?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=20`;
    console.log(`  arXiv query: ${query}`);
    const xml = await fetchPage(url);
    const parsed = parser.parse(xml);
    const entries = parsed.feed?.entry;
    if (!entries) continue;

    const items = Array.isArray(entries) ? entries : [entries];
    let kept = 0;

    for (const entry of items) {
      const id = (entry.id || '').trim();
      const arxivId = id.replace(/.*\/abs\/(\S+).*/, '$1') || id;
      if (seen.has(arxivId)) continue;
      seen.add(arxivId);

      const title = (entry.title || '').replace(/\s+/g, ' ').trim();
      const summary = (entry.summary || '').replace(/\s+/g, ' ').trim();
      if (!isRelevantPaper(title, summary)) continue;

      const authors = (entry.author ? (Array.isArray(entry.author) ? entry.author : [entry.author]) : [])
        .map(a => (a.name || '').trim()).filter(Boolean);

      const cats = entry.category ? (Array.isArray(entry.category) ? entry.category : [entry.category]) : [];
      const categories = cats.map(c => (typeof c === 'string' ? c : c['@_term'] || '').trim()).filter(Boolean);

      allPapers.push({
        arxiv_id: arxivId,
        title,
        authors,
        abstract: summary,
        published_date: entry.published || '',
        updated_date: entry.updated || '',
        url: `https://arxiv.org/abs/${arxivId}`,
        categories,
      });
      kept++;
    }
    console.log(`    ${items.length} entries, ${kept} kept`);
    await sleep(3000);
  }

  return allPapers;
}

/* ─── Relevance filter ─── */

function isRelevant(model) {
  const id = (model.id || '').toLowerCase()
  const tags = (model.tags || []).map(t => t.toLowerCase())

  // Exclude GGUF quantizations (re-uploads of other people's models)
  if (id.includes('gguf') || tags.includes('gguf')) return false

  // Keep only models with explicit Ethiopian connection in tags or id
  const ethiopianTags = ['am', 'ti', 'om', 'so', 'gz', 'amharic', 'tigrinya',
    'oromo', 'afaan', 'geez', 'somali', 'ethiopian', 'ethiopia', 'wolaytta', 'sidama']
  const hasEthiopianTag = ethiopianTags.some(et =>
    tags.includes(et) || id.includes(et)
  )

  return hasEthiopianTag
}

/* ─── Companies (hardcoded until a company scraper exists) ─── */

const COMPANIES = [
  {
    name: "iCog Labs",
    badge: "Company",
    bc: "b-co",
    desc: "AGI research lab working on robotics and African language NLP",
    langs: ["amharic"],
    isNew: false,
    tags: ["agi", "robotics", "nlp"],
    website: "https://icog-labs.com",
    github: "https://github.com/iCogLabs",
    hf_org: "",
    founded: "2013",
    models: [],
    verified: true,
    featured: false,
  },
  {
    name: "Addis AI",
    badge: "Company",
    bc: "b-co",
    desc: "Building Aleph ፩, the first foundational LLM for Ethiopian languages",
    langs: ["amharic", "tigrinya"],
    isNew: true,
    tags: ["llm", "research"],
    website: "https://addis.ai",
    github: "",
    hf_org: "https://huggingface.co/AddisAI",
    founded: "2023",
    models: [],
    verified: true,
    featured: true,
  },
  {
    name: "Hasab AI",
    badge: "Company",
    bc: "b-co",
    desc: "Amharic NLP infrastructure — translation, search, and semantic understanding",
    langs: ["amharic"],
    isNew: false,
    tags: ["nlp", "enterprise"],
    website: "https://hasabai.com",
    github: "",
    hf_org: "",
    founded: "2022",
    models: [],
    verified: true,
    featured: false,
  },
  {
    name: "EthioNLP",
    badge: "Company",
    bc: "b-co",
    desc: "Research collective publishing Ethiopian NLP datasets and benchmarks",
    langs: ["amharic", "tigrinya", "oromo"],
    isNew: false,
    tags: ["nlp", "research", "open-source"],
    website: "",
    github: "https://github.com/EthioNLP",
    hf_org: "https://huggingface.co/EthioNLP",
    founded: "2021",
    models: [],
    verified: true,
    featured: false,
  },
];

/* ─── Main ─── */

async function main() {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   goha.et — Scraper v2               ║");
  console.log("╚══════════════════════════════════════╝\n");

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const snapshotsDir = join(DATA_DIR, "snapshots");
  if (!existsSync(snapshotsDir)) mkdirSync(snapshotsDir, { recursive: true });

  /* ── 1. HuggingFace ── */
  console.log("── [1/4] HuggingFace ──");
  const allModels = [];
  const allDatasets = [];
  const allSpaces = [];

  for (const term of SEARCH_TERMS) {
    try {
      const models = await searchHuggingFace(term, "models");
      const relevant = models.filter(isRelevant);
      console.log(`    ${models.length} models for "${term}"  (${models.length - relevant.length} filtered)`);
      allModels.push(...relevant);
    } catch (err) {
      console.error(`  [ERROR] HF models "${term}": ${err.message}`);
    }
    try {
      const datasets = await searchDatasets(term);
      const relevant = datasets.filter(isRelevant);
      console.log(`    ${datasets.length} datasets for "${term}"  (${datasets.length - relevant.length} filtered)`);
      allDatasets.push(...relevant);
    } catch (err) {
      console.error(`  [ERROR] HF datasets "${term}": ${err.message}`);
    }
    try {
      const spaces = await searchSpaces(term);
      console.log(`    ${spaces.length} spaces for "${term}"`);
      allSpaces.push(...spaces);
    } catch (err) {
      console.error(`  [ERROR] HF spaces "${term}": ${err.message}`);
    }
    await sleep(500);
  }

  const dedupedModels = deduplicate(allModels);
  const dedupedDatasets = deduplicate(allDatasets);
  const dedupedSpaces = deduplicate(allSpaces);

  console.log(`\n  Deduped: ${dedupedModels.length} models, ${dedupedDatasets.length} datasets, ${dedupedSpaces.length} spaces`);

  console.log(`\n  Enriching ${dedupedModels.length} models from HuggingFace API...`);
  const enrichedModels = [];
  for (const m of dedupedModels) {
    const enriched = await enrichModelDetails(m);
    enrichedModels.push(enriched);
    await sleep(200); // 200ms delay to avoid aggressive rate limiting
  }

  console.log(`\n  HF Models:        ${enrichedModels.length}`);
  console.log(`  HF Datasets:      ${dedupedDatasets.length}`);
  console.log(`  HF Spaces:        ${dedupedSpaces.length}`);

  /* ── 2. GitHub ── */
  console.log("\n── [2/4] GitHub ──");
  const allRepos = [];

  for (const query of GH_SEARCHES) {
    try {
      const repos = await searchGitHubRepos(query);
      console.log(`    ${repos.length} repos for "${query.split("+")[0]}"`);
      allRepos.push(...repos);
    } catch (err) {
      console.error(`  [ERROR] GH search "${query}": ${err.message}`);
    }
    await sleep(500);
  }

  for (const org of GH_ORGS) {
    try {
      const repos = await fetchOrgRepos(org);
      console.log(`    ${repos.length} repos from org "${org}"`);
      allRepos.push(...repos);
    } catch (err) {
      console.error(`  [ERROR] GH org "${org}": ${err.message}`);
    }
    await sleep(500);
  }

  const dedupedRepos = deduplicate(allRepos);
  console.log(`\n  Deduped: ${dedupedRepos.length} repos`);

  /* ── 3. arXiv ── */
  console.log("\n── [3/4] arXiv ──");
  let arxivPapers = [];
  try {
    arxivPapers = await searchArxiv();
    console.log(`    ${arxivPapers.length} papers total`);
  } catch (err) {
    console.error(`  [ERROR] arXiv: ${err.message}`);
  }
  const dedupedPapers = deduplicate(arxivPapers);

  /* ── 4. Write db.json (current state, overwritten daily) ── */
  const db = {
    models: enrichedModels,
    datasets: dedupedDatasets,
    spaces: dedupedSpaces,
    papers: dedupedPapers,
    github_repos: dedupedRepos,
    companies: COMPANIES,
    meta: {
      last_updated: new Date().toISOString(),
      model_count: enrichedModels.length,
      dataset_count: dedupedDatasets.length,
    },
  };
  writeFileSync(join(DATA_DIR, "db.json"), JSON.stringify(db, null, 2));
  console.log(`  ✓ db.json  (${enrichedModels.length} models, ${dedupedDatasets.length} datasets, ${dedupedPapers.length} papers)`);

  /* ── 5. Write today's snapshot (never overwrite) ── */
  const today = new Date().toISOString().split("T")[0];
  const snapshot = {
    date: today,
    models: enrichedModels.map((m) => ({
      id: m.id,
      downloads: m.downloads_monthly ?? 0,
      likes: m.likes ?? 0,
    })),
    datasets: dedupedDatasets.map((d) => ({
      id: d.id,
      downloads: d.downloads_monthly ?? 0,
    })),
  };
  writeFileSync(join(snapshotsDir, `${today}.json`), JSON.stringify(snapshot, null, 2));
  console.log(`  ✓ snapshots/${today}.json  (${snapshot.models.length} models, ${snapshot.datasets.length} datasets)`);

  /* ── 6. Regenerate activity feed ── */
  console.log("Running feed generator...");
  try {
    execSync("node " + join(__dirname, "generate-feed.mjs"), { stdio: "inherit" });
  } catch (e) {
    console.error("Feed generation failed:", e.message);
  }

  /* ── 7. Build normalized output with computed trends ── */
  console.log("\n── [7/7] Build ──");
  try {
    execSync("node " + join(__dirname, "build.mjs"), { stdio: "inherit" });
  } catch (e) {
    console.error("Build failed:", e.message);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
