#!/usr/bin/env node
/**
 * Fails if a page title contains the brand more than once.
 *
 * Run after `pnpm build`:
 *   node scripts/check-page-titles.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "out");
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (entry.endsWith(".html")) files.push(full);
  }
}

walk(out);

const duplicates = [];
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const match = html.match(/<title>(.*?)<\/title>/s);
  if (!match) continue;
  const title = match[1];
  const count = (title.match(/goha/gi) ?? []).length;
  if (count > 1) duplicates.push([path.relative(out, file), title]);
}

if (duplicates.length > 0) {
  for (const [file, title] of duplicates) {
    console.error(`FAIL: ${file}: ${title}`);
  }
  console.error(
    `FAIL: ${duplicates.length} page title(s) contain "goha" more than once`
  );
  process.exit(1);
}

console.log(`PASS: ${files.length} page titles contain "goha" at most once`);
