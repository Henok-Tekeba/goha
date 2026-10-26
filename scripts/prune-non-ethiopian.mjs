#!/usr/bin/env node
/**
 * Re-validate every committed record against the Ethiopian-language evidence
 * rule and prune records whose ONLY connection is the owner/handle.
 *
 * Dry run by default (prints candidates). Pass --write to remove them from
 * data/models.json, data/datasets.json, data/spaces.json, data/repos.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { hasLanguageEvidence } from "../scraper/language-evidence.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");

const namePart = (id) => (id.includes("/") ? id.split("/").pop() : id);

/* Evidence-shape mapping for each committed record type. */
function evidenceFor(kind, rec) {
  if (kind === "repos.json") {
    return {
      name: (rec.full_name || rec.name || "").split("/").pop(),
      tags: rec.topics || rec.tags || [],
      languages: rec.language ? [rec.language] : [],
      descriptions: [rec.description || rec.desc || ""],
    };
  }
  return {
    name: rec.name || namePart(rec.id || ""),
    tags: rec.tags || [],
    languages: [
      ...(rec.languages || []),
      ...(rec.confirmed_languages || []),
      ...(rec.langs || []),
    ],
    descriptions: [rec.description || rec.desc || ""],
  };
}

/* Repos under the deliberately-curated Ethiopian orgs are in by design —
   their repo names ("website", "cogutil"…) show no language marker. */
const CURATED_GH_ORGS = new Set(["EthioNLP", "iCogLabs", "hasab-ai"]);

const FILES = ["models.json", "datasets.json", "spaces.json", "repos.json"];
let totalDropped = 0;

for (const file of FILES) {
  const path = join(ROOT, "data", file);
  const payload = JSON.parse(readFileSync(path, "utf8"));
  const items = Array.isArray(payload) ? payload : payload.data;

  const dropped = [];
  const kept = items.filter((rec) => {
    const orgOk =
      file === "repos.json" && CURATED_GH_ORGS.has(String(rec.owner || ""));
    const ok = orgOk || hasLanguageEvidence(evidenceFor(file, rec));
    if (!ok) {
      dropped.push(rec);
      return false;
    }
    return true;
  });

  if (dropped.length === 0) {
    console.log(
      `✓ ${file}: all ${items.length} records show Ethiopian evidence`
    );
    continue;
  }

  console.log(
    `\n${file}: ${dropped.length} of ${items.length} would be pruned:`
  );
  for (const rec of dropped) {
    console.log(`  - ${rec.id || rec.full_name || rec.name}`);
  }

  if (WRITE) {
    const next = Array.isArray(payload) ? kept : { ...payload, data: kept };
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`  → written (${kept.length} kept)`);
  }
  totalDropped += dropped.length;
}

console.log(
  `\n${totalDropped} candidate(s) ${WRITE ? "pruned" : "found (dry run; pass --write to prune)"}`
);
