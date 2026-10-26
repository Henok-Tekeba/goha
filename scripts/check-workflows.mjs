#!/usr/bin/env node
/**
 * Lightweight repository/workflow integrity checks.
 *
 * This intentionally uses no YAML parser: the checks are about a small,
 * reviewed set of properties that should not regress silently.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DIR = path.resolve(".github/workflows");
const failures = [];
const workflows = readdirSync(DIR)
  .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
  .sort();

if (workflows.length === 0) failures.push("no workflow files found");

for (const name of workflows) {
  const file = path.join(DIR, name);
  const source = readFileSync(file, "utf8");

  if (/\bpull_request_target\b/.test(source)) {
    failures.push(`${name}: pull_request_target is not allowed`);
  }
  if (/^\s*pull_request\s*:/m.test(source)) {
    failures.push(`${name}: pull_request workflows are not reviewed here`);
  }

  for (const match of source.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)) {
    const action = match[1];
    if (!/^[^@\s]+@[0-9a-f]{40}$/.test(action)) {
      failures.push(`${name}: action is not pinned to a full SHA: ${action}`);
    }
  }

  for (const match of source.matchAll(/^\s*run:\s*(.+)$/gm)) {
    const command = match[1];
    if (/\$\{\{\s*secrets\./i.test(command)) {
      failures.push(`${name}: secret interpolated into a shell command`);
    }
    if (/\$\{\{\s*github\.event\./i.test(command)) {
      failures.push(`${name}: event data interpolated into a shell command`);
    }
  }

  if (!/^permissions:/m.test(source)) {
    failures.push(`${name}: missing top-level permissions`);
  }
}

const deploy = readFileSync(path.join(DIR, "deploy-pages.yml"), "utf8");
if (!/pnpm install --frozen-lockfile/.test(deploy)) {
  failures.push("deploy-pages.yml: dependencies are not installed frozen");
}
if (!/path:\s*out\b/.test(deploy)) {
  failures.push("deploy-pages.yml: Pages artifact does not come from out/");
}
if (!/needs:\s*build/.test(deploy)) {
  failures.push("deploy-pages.yml: deploy does not depend on build");
}
if (!/environment:\s*\n\s+name:\s*github-pages/.test(deploy)) {
  failures.push("deploy-pages.yml: missing protected github-pages environment");
}

const scrape = readFileSync(path.join(DIR, "scrape.yml"), "utf8");
if (!/npm ci/.test(scrape)) {
  failures.push(
    "scrape.yml: scraper dependencies are not installed with npm ci"
  );
}
if (!/npm test/.test(scrape)) {
  failures.push("scrape.yml: scraper regression tests are not run");
}

if (failures.length > 0) {
  console.error("Workflow integrity check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.info(
  `✓ ${workflows.length} workflows: SHA-pinned actions, no PR-secret paths, frozen installs and build→artifact→deploy chain`
);
