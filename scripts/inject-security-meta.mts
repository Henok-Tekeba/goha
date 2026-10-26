/**
 * Insert the CSP and referrer policy at the very start of every exported
 * document's <head>.
 *
 * Next.js hoists its own bootstrap scripts into <head> before the children
 * declared in the root layout. A <meta> CSP only governs markup that follows
 * it, so placing the policy in `layout.tsx` would leave those early scripts
 * outside the policy. GitHub Pages cannot set response headers; this
 * post-export step is the closest equivalent for the static build.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { CONTENT_SECURITY_POLICY } from "../src/config/security";

const OUT = path.resolve("out");

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const META_BLOCK =
  `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(CONTENT_SECURITY_POLICY)}"/>\n` +
  `<meta name="referrer" content="no-referrer"/>`;

/*
 * Zod 4 probes `new Function` while its module is being evaluated. Setting
 * this global before any Next chunk loads keeps form validation usable under
 * the no-`unsafe-eval` CSP without weakening it. It is a constant assignment,
 * not a source of dynamic code. The flag is also honoured by z.config().
 */
const ZOD_JITLESS_BLOCK =
  "<script data-goha-zod-jitless>globalThis.__zod_globalConfig=Object.assign(globalThis.__zod_globalConfig||{},{jitless:true})</script>";

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}

let files = 0;
let skipped = 0;

for (const file of walk(OUT)) {
  let html = readFileSync(file, "utf8");

  if (!/<head(\s[^>]*)?>/i.test(html)) {
    skipped += 1;
    continue;
  }

  /* Make the step idempotent without touching Next's own meta tags. */
  html = html.replace(
    /<meta http-equiv="Content-Security-Policy"[^>]*>\s*/gi,
    ""
  );
  html = html.replace(/<meta name="referrer"[^>]*>\s*/gi, "");
  html = html.replace(
    /<script data-goha-zod-jitless[^>]*>[\s\S]*?<\/script>\s*/gi,
    ""
  );

  html = html.replace(
    /(<head(\s[^>]*)?>)/i,
    `$1\n${META_BLOCK}\n${ZOD_JITLESS_BLOCK}`
  );

  const policyAt = html.indexOf("Content-Security-Policy");
  const firstScriptAt = html.indexOf("<script");
  if (policyAt === -1 || (firstScriptAt !== -1 && policyAt > firstScriptAt)) {
    throw new Error(`CSP is not ahead of scripts in ${file}`);
  }

  /* The charset declaration must remain within the first 1024 bytes. */
  const charsetAt = html.search(/<meta[^>]*charset/i);
  if (charsetAt > 1024) {
    throw new Error(
      `charset declaration was pushed past 1024 bytes in ${file}`
    );
  }

  writeFileSync(file, html);
  files += 1;
}

if (files === 0) {
  throw new Error("No exported HTML files were found in out/");
}

if (skipped > 0) {
  console.warn(
    `inject-security-meta: skipped ${skipped} HTML files without <head>`
  );
}

console.info(`inject-security-meta: applied to ${files} HTML files`);
