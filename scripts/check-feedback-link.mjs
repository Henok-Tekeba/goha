#!/usr/bin/env node
/**
 * Verifies that the footer feedback link lands on a real anchor.
 *
 * Run after `pnpm build`:
 *   node scripts/check-feedback-link.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const home = readFileSync(path.join(root, "out", "index.html"), "utf8");
const contribute = readFileSync(
  path.join(root, "out", "contribute", "index.html"),
  "utf8"
);

const links = [
  ...home.matchAll(/<a\b[^>]*?href="([^"]*type=feedback[^"]*)"/g),
].map((match) => match[1].replaceAll("&amp;", "&"));

if (links.length === 0) {
  console.error("FAIL: no feedback link found on the homepage");
  process.exit(1);
}

let checked = 0;
for (const href of links) {
  const hash = href.split("#")[1];
  if (!hash) {
    console.error(`FAIL: feedback link has no anchor: ${href}`);
    process.exit(1);
  }

  const target = hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasAnchor = new RegExp(`\\b(?:id|name)="${target}"`).test(contribute);
  if (!hasAnchor) {
    console.error(`FAIL: ${href} -> #${hash} does not exist on /contribute/`);
    process.exit(1);
  }

  checked += 1;
}

console.log(`PASS: ${checked} feedback link(s) resolve to an anchor`);
