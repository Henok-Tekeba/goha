#!/usr/bin/env node
/**
 * Backfill Hugging Face's internal `_id` and `sha` into the committed raw data.
 * The daily scraper stores these fields going forward; this script is for the
 * current snapshot and is safe to re-run.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONCURRENCY = 8;

async function fetchWithRetry(url, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
      last = new Error(`${response.status} ${url}`);
    } catch (error) {
      last = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
  }
  throw last;
}

async function backfill(file, endpoint) {
  const filePath = path.join(ROOT, "data", file);
  const payload = JSON.parse(readFileSync(filePath, "utf8"));
  const items = Array.isArray(payload) ? payload : payload.data;
  let updated = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor++];
      if (!item.id) continue;
      try {
        const info = await fetchWithRetry(
          `https://huggingface.co/api/${endpoint}/${item.id}`
        );
        const nextInternal = info._id ?? item.hf_internal_id ?? null;
        const nextSha = info.sha ?? item.hf_sha ?? null;
        if (nextInternal !== item.hf_internal_id || nextSha !== item.hf_sha) {
          item.hf_internal_id = nextInternal;
          item.hf_sha = nextSha;
          updated += 1;
        }
      } catch (error) {
        console.error(`  ${item.id}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  writeFileSync(filePath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`${file}: ${updated}/${items.length} updated`);
}

await backfill("models.json", "models");
await backfill("datasets.json", "datasets");
