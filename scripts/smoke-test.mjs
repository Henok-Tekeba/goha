import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import { projectIdForSource } from "./project-id.mjs";

const BASE = (process.env.SMOKE_BASE_URL ?? "https://goha.enoch.et").replace(
  /\/$/,
  ""
);
const RETRIES = Number(process.env.SMOKE_RETRIES ?? 12);
const RETRY_MS = Number(process.env.SMOKE_RETRY_MS ?? 5000);
const FORBIDDEN = [
  "Bible gauche",
  "#form-heading",
  "BERT family family",
  "Wolayttattoo",
];
const ASR_LANGUAGES = new Set([
  "Amharic",
  "Afaan Oromo",
  "Tigrinya",
  "Ge'ez",
  "Somali",
  "Wolaytta",
  "Sidaamu Afoo",
  "English",
]);
const PAGES = [
  "/",
  "/lang/",
  "/lang/geez/",
  "/lang/wolaytta/",
  "/gaps/",
  "/leaderboard/",
  "/lineage/",
  "/compare/",
  "/ask/",
  "/orgs/",
  "/activity/",
  "/about/",
  "/api/",
  "/contribute/",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(path, attempts = RETRIES) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE}${path}`, {
        cache: "no-store",
        headers: { "user-agent": "goha-smoke-test" },
      });
      const body = await response.text();
      if (response.ok) return body;
      lastError = new Error(`${path} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) await sleep(RETRY_MS);
  }
  throw lastError;
}

async function fetchJson(path) {
  const body = await fetchText(path);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${path} did not return valid JSON`);
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log(`Smoke testing ${BASE}`);
  const html = new Map();
  for (const path of PAGES) {
    const body = await fetchText(path);
    assert.ok(body.length > 1000, `${path} returned suspiciously little HTML`);
    html.set(path, body);
    for (const forbidden of FORBIDDEN) {
      assert.ok(
        !body.includes(forbidden),
        `${path} contains forbidden string: ${forbidden}`
      );
    }
  }
  console.log(
    `✓ ${PAGES.length} routes returned 200 without forbidden strings`
  );

  const home = html.get("/");
  const homeText = stripHtml(home);
  assert.ok(
    homeText.includes("models, datasets, organizations and papers"),
    "homepage still uses the old footer copy"
  );
  assert.ok(
    !homeText.includes("every model, dataset, company and paper"),
    "homepage still uses 'every model, dataset, company and paper'"
  );
  const deltas = [
    ...home.matchAll(/title="7-day download growth"[\s\S]*?<\/span>/g),
  ]
    .map((match) => stripHtml(match[0].slice(match[0].indexOf(">") + 1)))
    .filter(Boolean);
  assert.ok(deltas.length > 0, "homepage has no mover deltas to inspect");
  for (const delta of deltas) {
    assert.match(
      delta,
      /^(?:[+-]\d+|0)%$/,
      `mover delta is missing an explicit sign: ${delta}`
    );
  }
  console.log(`✓ ${deltas.length} mover deltas carry explicit signs`);

  const projects = await fetchJson("/data/projects.json");
  assert.ok(Array.isArray(projects) && projects.length > 0);
  const ids = new Set();
  for (const project of projects) {
    assert.ok(project.id, "project is missing an id");
    assert.ok(project.sourceId, `${project.id} is missing sourceId`);
    assert.match(project.id, /^pjt_[a-f0-9]{32}$/);
    assert.equal(
      project.id,
      projectIdForSource(project.sourceId),
      `${project.id} does not match its source id`
    );
    assert.ok(!ids.has(project.id), `duplicate project id: ${project.id}`);
    ids.add(project.id);
  }
  const secondPass = await fetchJson("/data/projects.json");
  assert.deepEqual(
    secondPass.map((project) => project.id).sort(),
    projects.map((project) => project.id).sort(),
    "project ids changed between two reads"
  );
  const hfProjects = projects.filter((project) =>
    String(project.sourceId).startsWith("hf")
  );
  assert.ok(
    hfProjects.some((project) => project.hfInternalId),
    "no Hugging Face internal ids were stored"
  );
  console.log(
    `✓ ${projects.length} project ids are source-derived and stable; HF internal ids stored`
  );

  const legacy = JSON.parse(
    readFileSync("data/legacy-project-ids.json", "utf8")
  );
  const historyPath = "data/project-id-history.json";
  if (existsSync(historyPath)) {
    const history = JSON.parse(readFileSync(historyPath, "utf8"));
    const dates = Object.keys(history).sort();
    const previousDate = dates.at(-2);
    if (previousDate) {
      const currentById = new Map(
        projects.map((project) => [project.id, project.sourceId])
      );
      const currentSources = new Set(
        projects.map((project) => project.sourceId)
      );
      let carried = 0;
      for (const [id, sourceId] of Object.entries(history[previousDate])) {
        if (currentById.has(id)) continue;
        assert.ok(
          !currentSources.has(sourceId),
          `${sourceId} still exists but its id changed from ${id}`
        );
        if (legacy[id]) {
          const redirect = await fetchText(`/projects/${id}/`);
          assert.ok(
            redirect.includes(legacy[id]),
            `legacy id ${id} no longer redirects`
          );
          carried += 1;
        }
      }
      console.log(
        `✓ ${Object.keys(history[previousDate]).length} ids from ${previousDate} still resolve${carried ? ` (${carried} via redirect)` : ""}`
      );
    } else {
      console.log("• id history has one day; cross-day check starts tomorrow");
    }
  }

  const [legacyId, currentId] = Object.entries(legacy)[0] ?? [];
  assert.ok(legacyId && currentId, "legacy project mapping is empty");
  const legacyHtml = await fetchText(`/projects/${legacyId}/`);
  assert.ok(
    legacyHtml.includes(currentId),
    "legacy project id does not point at its stable replacement"
  );
  console.log("✓ legacy project ids redirect to stable ids");

  const leaderboard = await fetchJson("/data/leaderboard.json");
  const asr = leaderboard.sections.find((section) => section.task === "ASR");
  assert.ok(asr, "leaderboard has no ASR section");
  assert.ok(asr.rows.length > 0, "ASR section is empty");
  for (const row of asr.rows) {
    assert.ok(
      !/t5|mt5|sec2sec/i.test(row.model),
      `non-ASR model in ASR table: ${row.model}`
    );
    assert.equal(
      row.languages.length,
      1,
      `ASR row has the wrong language set: ${row.model} ${row.languages.join(", ")}`
    );
    assert.ok(
      ASR_LANGUAGES.has(row.languages[0]),
      `ASR row has an unknown language: ${row.model} ${row.languages[0]}`
    );
    if (row.dataset) {
      assert.ok(
        row.evaluationSource,
        `${row.model} is missing an evaluation source`
      );
    }
    if (row.embeddingDim) {
      assert.equal(
        row.dataset,
        null,
        `embedding dimension leaked into dataset for ${row.model}`
      );
    }
  }
  const fleurs = asr.rows.find((row) => /FLEURS/i.test(row.dataset ?? ""));
  assert.ok(fleurs, "ASR FLEURS row is missing");
  assert.ok(
    /\/datasets\//.test(fleurs.evaluationSource ?? ""),
    "FLEURS row does not link to the evaluation dataset"
  );
  const leaderboardText = stripHtml(html.get("/leaderboard/"));
  for (const language of new Set(asr.rows.map((row) => row.languages[0]))) {
    assert.ok(
      leaderboardText.includes(language),
      `ASR language missing from leaderboard page: ${language}`
    );
  }
  const irRows = leaderboard.sections
    .filter((section) => section.task === "Retrieval")
    .flatMap((section) => section.rows);
  assert.ok(
    irRows.some((row) => row.embeddingDim != null),
    "IR rows do not expose embedding dimensions"
  );
  console.log("✓ ASR is language-split and free of T5/sec2sec rows");

  const languageText = stripHtml(html.get("/lang/"));
  assert.ok(
    languageText.includes("Wolaytta"),
    "Wolaytta is missing from /lang"
  );
  console.log("✓ language spelling and scope copy present");

  console.log("Smoke test passed");
}

main().catch((error) => {
  console.error("Smoke test failed:", error);
  process.exit(1);
});
