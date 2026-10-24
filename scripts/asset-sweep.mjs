#!/usr/bin/env node
import { execSync } from "node:child_process";
/**
 * asset-sweep.mjs — one-shot migration: wraps literal public/ asset
 * references in src with asset(), injecting the import where needed.
 * Safe to re-run (idempotent).
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const files = execSync(
  `grep -rl '"/illustrations/\\|"/icons/\\|"/goha-logo\\|"/langs/\\|"/types/' src --include="*.tsx" --include="*.ts" | grep -v "fixtures/"`
)
  .toString()
  .trim()
  .split("\n");

const PATH_RE =
  /"(\/(?:illustrations|icons|langs|types|goha-logo|favicon\.ico)[^"]*)"/g;
let changed = 0;

for (const file of files) {
  let src = readFileSync(file, "utf8");
  const before = src;

  if (src.includes("asset(")) continue; // already migrated

  src = src.replace(PATH_RE, 'asset("$1")');

  if (src !== before) {
    // inject import after "use client" or first line
    if (
      /^\s*["']use client["'];?/m.test(src) &&
      !src.includes("@/shared/lib/asset")
    ) {
      src = src.replace(
        /(["']use client["'];?\n)/,
        '$1\nimport { asset } from "@/shared/lib/asset";'
      );
    } else if (!src.includes("@/shared/lib/asset")) {
      const firstImport = src.indexOf("import ");
      src =
        src.slice(0, firstImport) +
        'import { asset } from "@/shared/lib/asset";\n' +
        src.slice(firstImport);
    }
    writeFileSync(file, src);
    changed++;
    console.log("migrated:", file);
  }
}
console.log("files changed:", changed);
