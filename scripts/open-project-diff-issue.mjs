#!/usr/bin/env node
/**
 * Reads data/project-diff.json and opens (or reuses) a GitHub issue when
 * indexed records disappeared without an alias or legacy redirect.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const path = "data/project-diff.json";
if (!existsSync(path)) {
  console.log("No project diff report found.");
  process.exit(0);
}

const report = JSON.parse(readFileSync(path, "utf8"));
const disappeared = report.disappeared ?? [];
if (disappeared.length === 0) {
  console.log("✓ No unexplained disappeared records.");
  process.exit(0);
}

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
if (!token || !repository) {
  console.log(
    `! ${disappeared.length} disappeared record(s); set GITHUB_TOKEN and GITHUB_REPOSITORY to open an issue.`
  );
  for (const item of disappeared) {
    console.log(`  ${item.sourceId} (${item.id}) ${item.title ?? ""}`);
  }
  process.exit(0);
}

const headers = {
  authorization: `Bearer ${token}`,
  accept: "application/vnd.github+json",
  "content-type": "application/json",
  "user-agent": "goha-daily-diff",
};
const fingerprint = createHash("sha256")
  .update(
    disappeared
      .map((item) => item.sourceId)
      .sort()
      .join("\n")
  )
  .digest("hex")
  .slice(0, 8);
const title = `Daily scrape: ${disappeared.length} indexed item(s) disappeared [${fingerprint}]`;
const list = disappeared
  .map(
    (item) =>
      `- \`${item.sourceId}\` — ${item.title ?? "untitled"}\n` +
      `  old project id: \`${item.id}\`, HF internal id: \`${item.hfInternalId ?? "n/a"}\``
  )
  .join("\n");
const body = [
  `The ${report.generatedAt} build found records that disappeared without a source alias or legacy redirect.`,
  "",
  list,
  "",
  "If these removals are intentional, close this issue. If a Hugging Face repository was renamed or transferred, add it to `data/project-source-aliases.json`.",
].join("\n");

const openIssues = await fetch(
  `https://api.github.com/repos/${repository}/issues?state=open&per_page=100`,
  { headers, signal: AbortSignal.timeout(15_000) }
).then((response) => (response.ok ? response.json() : []));
if (openIssues.some((issue) => issue.title === title)) {
  console.log(`Issue already open: ${title}`);
  process.exit(0);
}

const response = await fetch(
  `https://api.github.com/repos/${repository}/issues`,
  {
    method: "POST",
    headers,
    body: JSON.stringify({ title, body }),
    signal: AbortSignal.timeout(15_000),
  }
);
if (!response.ok) {
  console.error(`Could not open issue: ${response.status}`);
  process.exit(1);
}
const issue = await response.json();
console.log(`Opened issue #${issue.number}: ${issue.html_url}`);
