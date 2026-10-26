import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";

import {
  CONTENT_SECURITY_POLICY,
  CONTENT_SECURITY_POLICY_HEADER,
  SECURITY_RESPONSE_HEADERS,
} from "@/config/security";

import { markdownRehypePlugins, markdownRemarkPlugins } from "./markdown";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.."
);
const SRC = path.join(ROOT, "src");

function renderMarkdown(content: string): string {
  return renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      {
        remarkPlugins: markdownRemarkPlugins,
        rehypePlugins: markdownRehypePlugins,
      },
      content
    )
  );
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

test("raw HTML in third-party markdown is sanitised", () => {
  const html = renderMarkdown(
    [
      "<script>window.__xss = 1</script>",
      `<iframe srcdoc="<script>parent.__xss = 1</script>"></iframe>`,
      `<iframe src="https://attacker.example"></iframe>`,
      `<object data="data:text/html,<script>alert(1)</script>"></object>`,
      `<embed src="data:text/html,<script>alert(1)</script>">`,
      "<style>body { display: none }</style>",
      `<meta http-equiv="refresh" content="0;url=https://attacker.example">`,
      `<base href="https://attacker.example/">`,
      `<form action="https://attacker.example"><input name="x"></form>`,
      `<svg onload="window.__xss = 1"></svg>`,
      `<img src="x" onerror="window.__xss = 1">`,
      `<img src="data:image/svg+xml,<svg onload=alert(1)>">`,
      `<a href="javascript:window.__xss = 1">click</a>`,
      `<a href="vbscript:msgbox(1)">vbscript</a>`,
      `<a href="data:text/html,<script>alert(1)</script>">data</a>`,
    ].join("\n\n")
  );

  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<iframe/i);
  assert.doesNotMatch(html, /srcdoc/i);
  assert.doesNotMatch(html, /<object/i);
  assert.doesNotMatch(html, /<embed/i);
  assert.doesNotMatch(html, /<style/i);
  assert.doesNotMatch(html, /<meta/i);
  assert.doesNotMatch(html, /<base/i);
  assert.doesNotMatch(html, /<form/i);
  assert.doesNotMatch(html, /<svg/i);
  assert.doesNotMatch(html, /onerror/i);
  assert.doesNotMatch(html, /onload/i);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /vbscript:/i);
  assert.doesNotMatch(html, /data:text\/html/i);
  assert.doesNotMatch(html, /data:image/i);
});

test("normal README markdown still renders", () => {
  const html = renderMarkdown(
    [
      "# Heading",
      "",
      "Some **bold** text and [a link](https://example.com).",
      "",
      "![alt text](https://example.com/image.png)",
      "",
      "```ts",
      "const answer = 42;",
      "```",
      "",
      "| a | b |",
      "| - | - |",
      "| 1 | 2 |",
      "",
      "<details><summary>More</summary>Hidden text</details>",
    ].join("\n")
  );

  assert.match(html, /<h1>Heading<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /href="https:\/\/example\.com"/);
  assert.match(html, /src="https:\/\/example\.com\/image\.png"/);
  assert.match(html, /class="language-ts"/);
  assert.match(html, /<table>/);
  assert.match(html, /<details>/);
  assert.match(html, /Hidden text/);
});

test("CSP blocks framing, plugins, form posts and inline event handlers", () => {
  assert.match(CONTENT_SECURITY_POLICY, /default-src 'self'/);
  assert.match(CONTENT_SECURITY_POLICY, /frame-src 'none'/);
  assert.match(CONTENT_SECURITY_POLICY, /object-src 'none'/);
  assert.match(CONTENT_SECURITY_POLICY, /form-action 'self'/);
  assert.match(CONTENT_SECURITY_POLICY, /script-src-attr 'none'/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY, /unsafe-eval/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY, /default-src \*/);
});

test("header policy extends the meta policy without widening it", () => {
  assert.ok(
    CONTENT_SECURITY_POLICY_HEADER.startsWith(`${CONTENT_SECURITY_POLICY};`)
  );
  assert.match(CONTENT_SECURITY_POLICY_HEADER, /frame-ancestors 'none'/);
  assert.equal(
    SECURITY_RESPONSE_HEADERS["Content-Security-Policy"],
    CONTENT_SECURITY_POLICY_HEADER
  );
  assert.equal(SECURITY_RESPONSE_HEADERS["X-Content-Type-Options"], "nosniff");
  assert.equal(SECURITY_RESPONSE_HEADERS["X-Frame-Options"], "DENY");
  assert.equal(SECURITY_RESPONSE_HEADERS["Referrer-Policy"], "no-referrer");
  assert.match(
    SECURITY_RESPONSE_HEADERS["Strict-Transport-Security"],
    /^max-age=31536000/
  );
  assert.doesNotMatch(
    SECURITY_RESPONSE_HEADERS["Strict-Transport-Security"],
    /preload/
  );
  assert.match(SECURITY_RESPONSE_HEADERS["Permissions-Policy"], /camera=\(\)/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY_HEADER, /unsafe-eval/);
  assert.doesNotMatch(CONTENT_SECURITY_POLICY_HEADER, /default-src \*/);
});

test("every ReactMarkdown instance uses the shared sanitised plugin lists", () => {
  const offenders: string[] = [];

  for (const file of walk(SRC)) {
    if (file.endsWith("markdown-security.test.ts")) continue;
    const source = readFileSync(file, "utf8");
    const relative = path.relative(ROOT, file);

    if (
      source.includes("rehype-raw") &&
      relative !== "src/shared/lib/markdown.ts"
    ) {
      offenders.push(`${relative}: imports rehype-raw directly`);
    }

    if (source.includes("<ReactMarkdown")) {
      if (!source.includes("markdownRehypePlugins")) {
        offenders.push(
          `${relative}: ReactMarkdown without markdownRehypePlugins`
        );
      }
      if (!source.includes("markdownRemarkPlugins")) {
        offenders.push(
          `${relative}: ReactMarkdown without markdownRemarkPlugins`
        );
      }
    }
  }

  assert.deepEqual(offenders, []);
});
