#!/usr/bin/env node
/**
 * Guards the muted-text contrast fix.
 *
 * Run after a source change:
 *   node scripts/check-contrast-tokens.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = path.join(root, "src");
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(tsx?|css)$/.test(entry)) files.push(full);
  }
}

walk(src);

const forbidden = [
  {
    pattern: /text-black\/(?:20|25|30|40|50)\b/g,
    label: "text-black/20-50 (use text-muted-foreground)",
  },
  {
    pattern: /text-success(?!-strong)\b/g,
    label: "text-success (use text-success-strong on light backgrounds)",
  },
];

const failures = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const rule of forbidden) {
    const matches = [...source.matchAll(rule.pattern)];
    for (const match of matches) {
      const line = source.slice(0, match.index).split("\n").length;
      failures.push(
        `${path.relative(root, file)}:${line} ${rule.label} (${match[0]})`
      );
    }
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  console.error(`FAIL: ${failures.length} contrast-token violation(s)`);
  process.exit(1);
}

console.log(
  `PASS: ${files.length} source files use the accessible muted tokens`
);
