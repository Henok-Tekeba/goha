/**
 * Local verification server for the production header policy.
 *
 * GitHub Pages cannot send headers, so this serves `out/` with the exact
 * response headers a proxy should add. It is a development tool only; do not
 * deploy it. Usage:
 *
 *   pnpm build
 *   pnpm preview:headers
 *   pnpm check:headers http://localhost:8090/
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SECURITY_RESPONSE_HEADERS } from "../src/config/security";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "out"
);
const PORT = Number(process.env.PORT ?? 8090);

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function resolveFile(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  } catch {
    return null;
  }

  if (decoded.includes("\0")) return null;

  const relative = decoded.replace(/^\/+/, "");
  const candidate = path.resolve(ROOT, relative);
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${path.sep}`)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  const index = path.join(candidate, "index.html");
  if (existsSync(index) && statSync(index).isFile()) return index;

  return null;
}

if (!existsSync(path.join(ROOT, "index.html"))) {
  console.error("out/index.html not found — run `pnpm build` first.");
  process.exit(1);
}

createServer((request, response) => {
  for (const [name, value] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
    response.setHeader(name, value);
  }

  const file = resolveFile(request.url ?? "/");
  if (!file) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end("Not found");
    return;
  }

  response.statusCode = 200;
  response.setHeader(
    "Content-Type",
    MIME[path.extname(file)] ?? "application/octet-stream"
  );
  createReadStream(file).pipe(response);
}).listen(PORT, "127.0.0.1", () => {
  console.info(
    `Serving out/ with security headers on http://127.0.0.1:${PORT}/`
  );
});
