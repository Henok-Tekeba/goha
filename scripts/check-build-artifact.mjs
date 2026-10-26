#!/usr/bin/env node
/**
 * Post-export artifact checks. Run after `next build` and the security-meta
 * injection so CI fails if a future dependency/config change reintroduces
 * source maps, mock-session code, missing CSP metadata or an inline-script
 * ordering problem.
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const failures = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(OUT);
const html = files.filter((file) => file.endsWith(".html"));
const js = files.filter((file) => file.endsWith(".js"));
const text = files.filter((file) =>
  /\.(html|js|json|txt|svg|css|xml|webmanifest)$/.test(file)
);

if (html.length === 0) failures.push("no HTML files exported");
if (files.some((file) => file.endsWith(".map"))) {
  failures.push("source map file present in out/");
}

let cspFailures = 0;
let charsetFailures = 0;
for (const file of html) {
  const body = readFileSync(file, "utf8");
  const policyAt = body.indexOf("Content-Security-Policy");
  const firstScriptAt = body.indexOf("<script");
  if (policyAt === -1) {
    failures.push(`${path.relative(OUT, file)}: missing CSP meta`);
    cspFailures++;
  } else if (firstScriptAt !== -1 && policyAt > firstScriptAt) {
    failures.push(`${path.relative(OUT, file)}: CSP after first script`);
    cspFailures++;
  }
  if (!body.includes('name="referrer"')) {
    failures.push(`${path.relative(OUT, file)}: missing referrer meta`);
  }
  if (!body.includes("data-goha-zod-jitless")) {
    failures.push(`${path.relative(OUT, file)}: missing Zod jitless bootstrap`);
  }
  if (/href="[^"]*\/auth\//.test(body)) {
    failures.push(`${path.relative(OUT, file)}: auth link present`);
  }
  if (/\bSign in\b/i.test(body)) {
    failures.push(`${path.relative(OUT, file)}: sign-in copy present`);
  }
  if (/\bClaim Project\b/i.test(body)) {
    failures.push(`${path.relative(OUT, file)}: claim-project copy present`);
  }
  const charset = body.match(/<meta[^>]*charset[^>]*>/i);
  if (charset && body.indexOf(charset[0]) > 1024) {
    failures.push(
      `${path.relative(OUT, file)}: charset after first 1024 bytes`
    );
    charsetFailures++;
  }
}

const joinedJs = js.map((file) => readFileSync(file, "utf8")).join("\n");
if (joinedJs.includes("mock-session-token") || joinedJs.includes("Mock mode")) {
  failures.push("dev-only mock session code is present in production JS");
}
if (joinedJs.includes("better-auth")) {
  failures.push("removed better-auth code is present in production JS");
}
if (joinedJs.includes("sourceMappingURL=")) {
  failures.push("sourceMappingURL reference present in production JS");
}

const secretPattern =
  /(hf_[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
for (const file of text) {
  if (secretPattern.test(readFileSync(file, "utf8"))) {
    failures.push(`${path.relative(OUT, file)}: secret-shaped string`);
  }
}

if (failures.length > 0) {
  console.error("Artifact check failed:");
  for (const failure of failures.slice(0, 20)) console.error(`  - ${failure}`);
  if (failures.length > 20) console.error(`  … ${failures.length - 20} more`);
  process.exit(1);
}

console.info(
  `✓ artifact: ${html.length} HTML pages, ${js.length} JS files, 0 maps, 0 mock-session strings; CSP/referrer/bootstrap present${cspFailures || charsetFailures ? " with issues" : ""}`
);
