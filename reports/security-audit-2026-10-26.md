# goha security audit — 2026-10-26

Scope: the `goha` repository, its static export, build/scrape scripts and the
authorized public deployment at `https://goha.enoch.et`. Testing was limited
to local builds, local HTTP serving and read-only inspection of the live
response headers. No production exploitation, load testing or destructive
database work was performed.

## Executive summary

goha is a read-only static export. It has no server runtime, database, API
keys, payment flow or production authentication. The material security risk is
therefore **third-party content rendered in visitors' browsers**, not
server-side injection or broken object authorization.

One high-confidence stored HTML/XSS path was confirmed and fixed: raw HTML from
model cards, READMEs, arXiv abstracts and repository descriptions was rendered
with `rehype-raw` and no sanitizer. A malicious `<iframe srcdoc>` payload
executed JavaScript in the site origin during browser verification. Every
markdown renderer now uses a shared `rehype-sanitize` allowlist, with
regression tests. A CSV formula-injection gap in the leaderboard export was
also fixed.

The final hardening pass closed the production dependency audit, removed the
dev-only mock-session code from the production bundle, added bounded scraper
fetches, hardened the generated-code path and SHA-pinned/permission-scoped the
GitHub Actions workflows. Final local build/test/browser verification passes,
and the effective header policy passes against a local header server.

The application is **ready for a static-site production deployment** from a
code-security perspective, with the caveat that GitHub Pages cannot send
response security headers. The repository injects a CSP and `Referrer-Policy`
into every exported page, but `frame-ancestors`, `X-Frame-Options`,
`X-Content-Type-Options` and HSTS require a host/proxy that supports headers.
The recommended low-change path is Cloudflare proxy + one Response Header
Transform Rule in front of the existing GitHub Pages origin. That change has
**not** been applied: the live header check currently fails, and the live site
has not yet received the newly built meta CSP. No DNS, hosting, routing or
production infrastructure was changed without approval.

No critical or high-severity issue remains open that is reachable in the
deployed static runtime. The only material unresolved deployment gap is the
missing live response-header layer.

## Architecture and attack surface

| Area | Finding |
|---|---|
| Frontend | Next.js 15.5.28 App Router, React 19.2.6, Tailwind 4, static export (`output: "export"`) |
| Hosting | GitHub Pages at `goha.enoch.et` via `public/CNAME`; `deploy-pages.yml` |
| Server runtime | None in production. No Next API routes, server actions, middleware or database. |
| Data | Daily scraper (HF/GitHub/arXiv) → `data/*.json` → `scripts/build-goha-fixtures.mjs` → `public/data/*.json` |
| Auth | No public auth routes. The read-only product has no login/onboarding/dashboard/profile pages; saved projects are browser-local. The mock API is dev-only. |
| Uploads / files | No production upload or download service; markdown images are remote URLs. |
| External services | Build-time only: Hugging Face, GitHub API, arXiv. Runtime: optional Goatcounter analytics. |
| Trust boundaries | Upstream metadata → committed fixtures → static HTML/JS → visitor browser. The upstream content is untrusted. |
| Public entry points | 1,153 HTML documents, including project pages, README/CoC drawers, issue drawers, leaderboard CSV export, contribution issue links and the local `/saved` watchlist. |
| Admin / privileged | None. The former dashboard/profile/create/auth routes were removed; write services reject as read-only. |
| Secrets | Only `.env.example` is tracked. Scrape secrets (`HF_TOKEN`, `GH_TOKEN`) are repository secrets. No live secrets found in the current tree by regex scan. |

## Findings

### F-01 — Stored HTML injection / XSS in third-party markdown

- **Severity / confidence:** High / High (confirmed in Chromium).
- **Affected:** `src/shared/components/ui/markdown-renderer.tsx`,
  `src/features/projects/components/project-readme.component.tsx`,
  `project-code-of-conduct.component.tsx`, `contributing.component.tsx`,
  `step-git-confirm.form.tsx`, `issue-detail-sheet.component.tsx`.
- **Root cause:** `rehype-raw` parsed untrusted HTML into the React tree with no
  `rehype-sanitize` (or equivalent) allowlist. React blocks `javascript:` URLs
  and drops string `onerror` handlers, but it preserves `<iframe srcdoc>`,
  `<style>`, `<meta http-equiv=refresh>`, `<form>` and similar markup.
- **Attack scenario:** A publisher of an Ethiopian-language HF model, GitHub
  README or arXiv paper places an `<iframe srcdoc="<script>…">` in metadata
  that the scraper indexes. The payload executes in the goha origin when a
  visitor opens the project page. This is stored, not reflected, and affects
  every visitor to that page.
- **Evidence / reproduction:** With a materialized readme, the old renderer
  emitted `<iframe srcDoc="...">`; Chromium executed the srcdoc script in the
  same origin. After the fix, the materialized payload rendered the benign
  heading/text but no iframe, script, meta refresh, inline handler or style;
  `window.__xss` stayed unset.
- **Fix:** Added `src/shared/lib/markdown.ts` with `rehype-raw` followed by
  `rehype-sanitize` (GitHub-style allowlist) and switched every renderer to it.
  Added image `referrerPolicy="no-referrer"` and lazy/async decoding.
- **Regression:** `pnpm test:security` renders XSS payloads and asserts no
  active markup, checks normal markdown still renders, and fails if any
  `ReactMarkdown` instance or direct `rehype-raw` import bypasses the shared
  lists.

### F-02 — CSV formula injection in leaderboard export

- **Severity / confidence:** Medium / High.
- **Affected:** `src/features/ecosystem/views/leaderboard.view.tsx`.
- **Root cause:** `csvEscape` handled quotes/commas/newlines but not leading
  `=`, `+`, `-`, `@`, tab or carriage return.
- **Attack scenario:** A model or organization name beginning with a formula
  is exported, then opened in Excel/Numbers/Sheets. A formula can make external
  requests or, in older Excel configurations, invoke DDE commands.
- **Fix:** Added `src/features/ecosystem/lib/csv.ts`; non-numeric cells with a
  formula prefix are prefixed with `'`, then quoted as needed.
- **Regression:** `pnpm test:security` covers formula prefixes, quoting and
  numeric values.

### F-03 — Missing / host-limited security headers

- **Severity / confidence:** Medium / High (hardening gap, not by itself an
  exploit).
- **Affected:** deployment host and global layout.
- **Root cause:** GitHub Pages does not allow custom response headers; the
  repository previously sent no CSP, referrer policy, nosniff or frame
  protection.
- **Fix:** `scripts/inject-security-meta.mts` injects a CSP and
  `Referrer-Policy: no-referrer` at the **start** of every exported `<head>`
  (before Next's bootstrap scripts). The policy blocks external scripts,
  external frame loads, objects, cross-origin form posts and inline event
  handlers, and allows only self + optional Goatcounter.
- **Limit:** A meta policy cannot express `frame-ancestors`, `report-uri` or
  `sandbox`; `frame-src 'none'` does not stop a directly injected
  `<iframe srcdoc>`. Browser verification confirmed the latter, which is why
  F-01's sanitizer is the primary control. `X-Frame-Options`,
  `X-Content-Type-Options`, HSTS and a header-level CSP remain deployment
  actions for a proxy/CDN.
- **Verification:** all 1,174 HTML files contain the policy and referrer tag
  before the first `<script>`; 13 representative routes loaded with no CSP
  violations in Chromium.

### F-04 — Production source maps shipped

- **Severity / confidence:** Low / High.
- **Affected:** `next.config.ts`.
- **Root cause:** `productionBrowserSourceMaps: true` plus a webpack
  `nosources-source-map` override.
- **Impact:** 112 `.map` files in the previous `out/` exposed internal module
  paths (no `sourcesContent`). Low direct impact but unnecessary attack-surface
  and download weight.
- **Fix:** Disabled production browser source maps. Final build contains 0
  `.map` files.

### F-05 — `target="_blank"` without `rel` in external links component

- **Severity / confidence:** Low / High.
- **Affected:** `src/shared/components/ui/external-link.tsx`.
- **Fix:** Added `rel="noopener noreferrer"`. Modern browsers already implied
  `noopener`; this makes the intent explicit.

### F-06 — React Query devtools rendered in production

- **Severity / confidence:** Low / High.
- **Affected:** `src/app/providers.tsx`.
- **Fix:** Devtools now render only when `NODE_ENV === "development"`. The
  package remains in the static import graph (low impact; no auth/session data
  exists), but the production UI no longer exposes the devtools control.

### F-07 — Vulnerable Next.js version (critical advisory, not reachable here)

- **Severity / confidence:** High advisory / High on version, High on
  non-reachability in this architecture.
- **Affected:** `next@15.5.26`.
- **Advisory:** GHSA-2464-fhr4-w9xw — unauthenticated RCE in the Image
  Optimization API when SVG files are used.
- **Why not reachable:** `output: "export"` produces no Next server and
  `images.unoptimized: true`; there is no `/_next/image` endpoint in `out/`.
- **Fix:** Upgraded to `next@15.5.28` (patched). Build and all routes verified.

### F-08 — Vulnerable XML parser in scraper

- **Severity / confidence:** High advisory / Medium exploitability (CI
  availability).
- **Affected:** `scraper/package.json`, `scraper/package-lock.json`.
- **Advisory:** GHSA-8r6m-32jq-jx6q — repeated DOCTYPE declarations reset
  entity-expansion limits in `fast-xml-parser`.
- **Impact:** Malformed arXiv XML could exhaust resources during the daily
  scrape; it does not execute in visitors' browsers.
- **Fix:** Upgraded to `fast-xml-parser@5.11.2`; `npm audit --omit=dev` in
  `scraper/` reports 0 vulnerabilities.

### F-09 — Unused production dependency and misclassified build tool

- **Severity / confidence:** Informational / High.
- **Affected:** `package.json`, `src/shared/lib/auth-client.ts`.
- **Finding:** `better-auth` was unused in the static app and `auth-client.ts`
  had no importers. `@opennextjs/cloudflare` is only a build/deploy tool but
  was a production dependency.
- **Fix:** Removed `better-auth` and the unused client; moved
  `@opennextjs/cloudflare` to `devDependencies`. This removes unused runtime
  supply-chain surface and several transitive advisories from the production
  audit.

### F-10 — Production dependency advisories (closed in the final pass)

The initial pass left 7 production advisories (4 high, 3 moderate) because
Next pinned PostCSS 8.4.31, `source-map-js` 1.2.1, `prismjs` 1.27.0 via
refractor, and Zod 3.25.76. The final pass applied tested, compatible
resolutions:

| Advisory | Package / range | Path | Runtime / reachability | Resolution |
|---|---|---|---|---|
| GHSA-qx2v-qp2m-jg93 | `postcss` <8.5.10 | `next>postcss` | Build-time CSS processing; repository CSS only | Override to 8.5.31; build/browser tested |
| GHSA-6g55-p6wh-862q | `postcss` <=8.5.11 | `next>postcss` | Build-time; no attacker-controlled CSS in the deployed runtime | 8.5.31 |
| GHSA-fxqj-rqcc-2cmp | `postcss` <=8.5.22 | `next>postcss` | Build-time; no runtime CSS compiler | 8.5.31 |
| GHSA-r28c-9q8g-f849 | `postcss` <=8.5.17 | `next>postcss` | Build-time; no runtime CSS compiler | 8.5.31 |
| GHSA-68fv-2mgg-jv7q | `source-map-js` >=1.0.0 <1.2.2 | `next>postcss>source-map-js`, Tailwind | Build-time only; source maps are disabled | Override to 1.2.2 |
| GHSA-x7hr-w5r2-h6wg | `prismjs` <1.30.0 | `react-syntax-highlighter>refractor>prismjs` | Browser syntax highlighting of a code **string**; vulnerable `highlightElement` DOM path not used | Override to 1.30.0; verified token spans in Chromium |
| GHSA-mrhx-c7xc-m3w5 | `zod` <4.6.6 | direct `zod` | Client form validation only; no server request validation | Upgraded to 4.6.7; `_type` usage migrated; Zod 4 JIT disabled for CSP |

**Result:** `pnpm audit --prod` now reports **0 vulnerabilities** (verified with
both pnpm 12 locally and pnpm 10.33.4, the CI version). The scraper audit also
reports **0**. A full `pnpm audit` still reports 2 critical / 8 high / 9
moderate / 3 low advisories, all in dev-only paths (`concurrently`,
`express`/`msw`, `@opennextjs/cloudflare`, `wrangler`, `miniflare`); these are
not shipped in the static site or the scrape artifact. They are listed in the
final risk section rather than suppressed.

### F-11 — Informational observations (updated)

- **No secrets in the current tree.** Regex scans over tracked files and the
  final `out/` returned no matches. Git history was not exhaustively audited.
- **CORS `access-control-allow-origin: *`** on the live site is GitHub Pages'
  default for public static files. The content is public and no credentials are
  used, so this is not a credentialed-CORS vulnerability.
- **Mock session code is no longer shipped.** The production webpack build
  aliases `@/mocks/provider.mock` to a no-op module when
  `NEXT_PUBLIC_API_MOCKING` is not `enabled`; the final bundle contains neither
  `mock-session-token` nor `Mock mode` (verified: 0 matching chunk files).
- **GitHub Actions are now SHA-pinned** with least-privilege job permissions
  and `persist-credentials: false` on read-only checkouts.
- **Build/scrape fetches now have timeouts and bounded response sizes**, so a
  registry or GitHub outage cannot hang the workflow indefinitely.
- **Unpinned transitive action:** `actions/upload-pages-artifact@v3` (pinned)
  internally uses `actions/upload-artifact@v4` by tag. We cannot pin that
  internal dependency from this repository; it remains a supply-chain residual.

### F-12 — Zod 4 JIT conflicts with the no-eval CSP

- **Severity / confidence:** Medium / High (observed in Chromium).
- **Affected:** form pages using `@hookform/resolvers/zod` and Zod 4 (the
  former `/projects/create/tech-categories/` and `/onboarding/` routes; both
  were later removed with the dead auth/create flow).
- **Root cause:** Zod 4 probes/compiles with `new Function`. The strict CSP
  rejects it, producing `securitypolicyviolation` events on
  `/projects/create/tech-categories/` and `/onboarding/`.
- **Why it matters:** The easy “fix” would be adding `'unsafe-eval'`, which
  would weaken the policy. That was rejected.
- **Fix:** The build injects a constant inline bootstrap that sets
  `globalThis.__zod_globalConfig.jitless = true` **before** any Next chunk
  loads. This is the documented Zod CSP mode and contains no dynamic code.
  Zod 4.6.7 is retained. The inline bootstrap is covered by the existing
  `script-src 'unsafe-inline'` required by Next.
- **Evidence:** Before the shim, 2 `script-src`/`eval` violations on each form
  page; after, 0 violations with the header CSP active. The form page renders
  and the syntax-highlighted code block still works.

### F-13 — Dev-only mock session code in the production bundle

- **Severity / confidence:** Low / High.
- **Affected:** `src/app/providers.tsx`, `src/mocks/provider.mock.tsx`,
  `src/mocks/session.mock.ts`.
- **Root cause:** Static import of `MockSessionToggle` kept the dev-only
  `mock-session-token` and toggle code in the production layout chunk even
  though it rendered `null`.
- **Fix:** `next.config.ts` aliases `@/mocks/provider.mock` to a no-op
  `provider.mock.disabled.tsx` when mocks are not explicitly enabled. The real
  mock module remains available for `pnpm dev:mock`.
- **Evidence:** Final `out/_next/static/chunks` contains 0 files matching
  `mock-session-token` or `Mock mode`. No production auth was removed; the
  disabled auth service and read-only UI are unchanged.

### F-14 — Scraper fetches had no timeout or response-size bound

- **Severity / confidence:** Medium / High.
- **Affected:** `scraper/index.mjs`, `scraper/http.mjs`.
- **Root cause:** `fetchPage` used unbounded `await res.text()` and no abort
  signal. A slow/hostile registry response could hang or exhaust the scrape
  job, which runs with repository-write credentials.
- **Fix:** Added `scraper/http.mjs` with a 30 s timeout, 10 MiB cap (declared
  and streamed), bounded retries, and URL-segment encoding for HF ids.
  `scraper/http.test.mjs` covers valid, oversized, streamed-oversized and
  stalled responses (5/5 pass).
- **Evidence:** `npm test` in `scraper/` passes; `scraper/npm audit --omit=dev`
  reports 0 vulnerabilities.

### F-15 — Shell command construction from a filesystem path

- **Severity / confidence:** Low / High (local/CI reliability and command
  construction).
- **Affected:** `scraper/index.mjs`.
- **Root cause:** `execSync("node " + join(...))` builds a shell command from a
  path. A checkout path containing spaces or shell metacharacters can break or
  alter the command.
- **Fix:** Replaced both calls with `execFileSync(process.execPath, [script])`,
  which passes arguments directly with no shell.

### F-16 — Generated TypeScript interpolated an unescaped category name

- **Severity / confidence:** Low / High (future-codegen guard).
- **Affected:** `scripts/build-goha-fixtures.mjs`.
- **Root cause:** `taxonomy.mock.ts` was generated with
  `name: "${c.name}"` while tech stacks used `JSON.stringify`. Categories are
  currently hardcoded, so no current upstream path reaches it, but a future
  change could turn a quote/newline into generated application code.
- **Fix:** Category names now use `JSON.stringify`, matching the tech-stack
  generator.

### F-17 — Workflow and repository integrity hardening

- **Severity / confidence:** Medium / High (supply-chain).
- **Findings:** Actions were referenced by movable tags; broad top-level
  permissions were inherited by every job; read-only checkouts persisted
  credentials; jobs had no timeout; the scrape workflow had no overlapping-run
  guard; scraper tests were not run in CI.
- **Fix:** All `uses:` actions are pinned to full commit SHAs, with the version
  in a comment. Permissions are split by job (`contents: read` for build/smoke;
  `pages: write` + `id-token: write` only for deploy; scrape keeps only
  `contents: write` + `issues: write`). Read-only checkouts set
  `persist-credentials: false`. Jobs have timeouts and concurrency guards.
  `pnpm install --frozen-lockfile` and `npm ci` are enforced. The scraper HTTP
  tests run before the scrape. `scripts/check-workflows.mjs` is now part of
  `pnpm build` and rejects unpinned actions, PR secret paths, non-frozen
  installs and a broken build→artifact→deploy chain.
- **Evidence:** `pnpm test:workflows` passes for all 3 workflows; YAML parses
  cleanly. No `pull_request`/`pull_request_target` trigger exists, so fork PRs
  cannot reach repository secrets.
- **Residual:** `actions/upload-pages-artifact@v3` internally uses
  `actions/upload-artifact@v4` by tag; that nested reference is outside this
  repo’s control.

### F-18 — Production headers are still not active

- **Severity / confidence:** Medium / High.
- **Evidence:** `pnpm check:headers` against `https://goha.enoch.et/` reports
  every response header missing and no meta CSP in the currently deployed
  HTML. Local `out/` has the meta CSP and the header server passes the full
  header policy.
- **Current DNS/hosting:** `goha.enoch.et` CNAME → `henok-tekeba.github.io`;
  A records are GitHub Pages; `enoch.et` is delegated to Cloudflare
  nameservers; responses show GitHub/Fastly and no `cf-ray`, so Cloudflare is
  DNS-only. GitHub Pages cannot set response headers.
- **Recommended architecture (not applied):** keep GitHub Pages as origin,
  enable the existing Cloudflare proxy (orange cloud) for `goha`, set SSL/TLS
  to Full (strict), and add one Cloudflare Response Header Transform Rule with
  `SECURITY_RESPONSE_HEADERS`. This preserves the domain, static export,
  Actions deployment and certificate, and is reversible without a deploy.
  Exact steps and header values are in `SECURITY.md`. CAA currently allows
  Let's Encrypt, DigiCert and Sectigo; verify the Cloudflare edge issuer (add
  `pki.goog` only with DNS approval if required).
- **Verification:** local header server + `pnpm check:headers` PASS; Chromium
  across 14 content/form routes: 0 CSP violations, charts render, no console or
  page errors. Live check intentionally FAILS until the proxy rule is
  approved. No DNS, hosting, routing or production infrastructure was changed.

### F-20 — Stale legacy redirects pointed at missing projects

- **Severity / confidence:** Low / High (found by crawling the built output).
- **Affected:** `data/legacy-project-ids.json`, `scripts/build-goha-fixtures.mjs`,
  `src/app/projects/[projectId]/page.tsx`.
- **Root cause:** Eight legacy IDs pointed at records that no longer exist in
  the current fixture, producing meta-refresh pages that landed on a 404.
- **Fix:** The fixture builder now drops any legacy alias whose target is not a
  current project; the stale committed entries were pruned. `pnpm test:ids`
  now asserts that every legacy redirect targets a current project.
- **Evidence:** Full internal-link crawl of `out/**/*.html` reports 0 missing
  targets. The page count dropped from 1,161 to 1,153 as the eight dead
  redirect pages were removed.

### F-19 — Dead auth gates and a capped search on a read-only site

- **Severity / confidence:** High product/trust issue / High (reproduced in
  Chromium).
- **Affected:** `bookmark-button.component.tsx`,
  `claim-project-button.component.tsx`, `search-command.component.tsx`,
  `src/app/auth/login`, `src/app/onboarding`, `src/app/dashboard`,
  `src/app/profile/me`, `src/app/projects/create`,
  `blurred-signin-cta-grid.component.tsx`, header/mobile auth menus.
- **Root cause:** The UI was inherited from a product with accounts, but goha
  has no backend/auth. Bookmark and claim buttons pushed visitors to
  `/auth/login`; the login page rendered “Sign in with Github/Gitlab” even
  though sign-in throws. Search stopped after 60 projects and showed “Sign in
  to see more projects.” The privacy policy simultaneously claimed the
  watchlist was browser-local. The dead dashboard/profile/create routes were
  still reachable.
- **Impact:** A visitor trying to save a model or paper hit a dead login wall;
  search missed most of the 470-record index; several routes exposed broken
  product flows. This is exactly the kind of launch-readiness failure that
  erodes trust even when the code has no server-side vulnerability.
- **Fix:**
  - Replaced server/auth bookmarks with a browser-local watchlist
    (`localStorage`, 1,000-item cap) and added `/saved`.
  - Removed the Claim Project flow and the old publish/edit branches.
  - Removed the 60-project cap and the “Sign in” search item; search now loads
    all 470 published projects.
  - Deleted the auth/login, onboarding, dashboard, profile/me and
    projects/create routes; removed `OnboardingRedirect` and the header/mobile
    user menus.
  - Updated the privacy policy to point at `/saved` and state the watchlist
    never leaves the device.
- **Regression:** `pnpm test:bookmarks` (3/3) covers parsing, dedupe, cap and
  toggling. Chromium verification on 14 public routes found 0 “Sign in” text,
  0 `/auth/` links and 0 “Claim Project” text; bookmarking a research paper
  persisted across reload and appeared on `/saved`; a search for a project
  beyond the old 60-item cap (“Whispering in Amharic”, index 402) found it.
- **Note:** Auth/profile/dashboard *source components* remain in the tree for
  a future product, but they have no routes or live entry points and are not in
  the exported bundle.

## Changes made

### Files

- `src/shared/lib/markdown.ts` (new) — shared `remark-gfm` + `rehype-raw` +
  `rehype-sanitize` plugin lists.
- `src/shared/lib/markdown-security.test.ts` (new) — XSS, safe-markdown, CSP
  and “no bypassing renderer” regression tests.
- `src/shared/validations/zod.test.ts` (new) — Zod 4 jitless form-contract test.
- Six renderer files updated to the shared plugin lists (F-01).
- `src/features/ecosystem/lib/csv.ts` + `csv.test.ts` (new) — formula guard.
- `src/features/ecosystem/views/leaderboard.view.tsx` — uses shared CSV guard.
- `src/config/security.ts` (new) — meta CSP, full header CSP, and
  `SECURITY_RESPONSE_HEADERS`.
- `scripts/inject-security-meta.mts` (new) — post-export head injection,
  CSP-before-scripts/charset assertions, and the Zod `jitless` bootstrap.
- `scripts/serve-with-security-headers.mts` / `scripts/check-live-headers.mts`
  (new) — local header simulation and live read-only header verification.
- `next.config.ts` — source maps disabled; production alias for the mock
  provider.
- `src/app/providers.tsx` — devtools gated to development.
- `src/shared/components/ui/external-link.tsx` — `noopener noreferrer`.
- `src/shared/components/ui/markdown-components.tsx` and
  `project-readme.component.tsx` — lazy/no-referrer images.
- `src/mocks/provider.mock.disabled.tsx` (new) — production no-op replacement.
- `package.json` / `pnpm-lock.yaml` — Next 15.5.28, `rehype-sanitize` 6.0.0,
  Zod 4.6.7, PostCSS 8.5.31, source-map-js 1.2.2, Prism 1.30.0, remove
  `better-auth`, move OpenNext to dev, add `test:security`,
  `test:workflows`, `check:headers`, `preview:headers`, and CSP injection to
  `build`.
- `pnpm-workspace.yaml` — security overrides for PostCSS, source-map-js and
  Prism.
- `scraper/http.mjs`, `scraper/http.test.mjs` (new), `scraper/index.mjs`,
  `scraper/package.json` — bounded fetches, safe `execFileSync`, scraper tests.
- `scripts/check-workflows.mjs` (new) — workflow integrity regression checks.
- `scripts/check-build-artifact.mjs` (new) — post-export map/mock/CSP/secret/auth-link checks.
- `.github/workflows/{deploy-pages,scrape,security-check}.yml` — SHA pins,
  least-privilege permissions, timeouts, concurrency, frozen installs, scraper
  tests; new manual security baseline workflow.
- `scripts/build-goha-fixtures.mjs` — generated category names are JSON-escaped.
- `scripts/open-project-diff-issue.mjs`, `scripts/smoke-test.mjs`,
  `src/shared/lib/github-stars.ts` — fetch timeouts.
- `.gitignore` — ignore `scraper/node_modules`.
- `SECURITY.md` (new/updated), `README.md` — security model, reporting, header
  architecture and exact deployment steps.
- `src/shared/lib/auth-client.ts` — removed (unused).
- `src/shared/lib/bookmarks.ts`, `src/shared/hooks/use-local-bookmarks.hook.ts`,
  `src/shared/lib/bookmarks.test.ts` (new) — local, account-free watchlist.
- `src/app/saved/page.tsx`, `src/features/projects/views/saved-projects.view.tsx`
  (new) — saved-projects page.
- Header, mobile menu, footer and README — Saved entry points; auth user menus
  removed.
- `bookmark-button.component.tsx`, `project-hero.component.tsx`,
  `search-command.component.tsx` — local bookmarks, no claim/auth gates, all
  470 projects searchable.
- Removed `src/app/auth`, `src/app/onboarding`, `src/app/dashboard`,
  `src/app/profile`, `src/app/projects/create`; removed the blurred sign-in
  grid, claim button and old bookmark mutation hook.
- `src/app/robots.ts` — removed paths for deleted routes.
- `data/legacy-project-ids.json`, `scripts/build-goha-fixtures.mjs`,
  `src/features/ecosystem/lib/project-id.test.ts` — prune and test redirects to
  current projects only.

### Behavior changes

- Raw HTML in markdown is still rendered for safe elements (`details`,
  `picture`, tables, badges), but scripts, iframes, forms, style/meta/base and
  event handlers are removed.
- Markdown images use `loading="lazy"`, `decoding="async"` and
  `referrerPolicy="no-referrer"`.
- `pnpm build` now runs workflow-integrity and security tests, post-processes
  every exported HTML file, and runs an artifact check for source maps,
  mock-session strings, CSP/referrer/bootstrap metadata, charset placement and
  secret-shaped strings. If any check fails, the build fails.
- Production source maps are no longer emitted.
- CSV cells starting with formula characters are exported as text.
- The production bundle excludes the dev-only mock-session toggle and token;
  `pnpm dev:mock` still uses the real mock module.
- Zod validation runs in `jitless` mode under the strict CSP; no
  `unsafe-eval` was added.
- Scraper HTTP requests have timeouts and a 10 MiB response cap.

## Verification

| Check | Result |
|---|---|
| `pnpm type-check` | Pass |
| `pnpm lint` | Pass (0 errors; 66 warnings / 23 infos) |
| `pnpm test:security` | 9/9 pass |
| `pnpm test:bookmarks` | 3/3 pass |
| `pnpm test:workflows` | Pass — 3 workflows, SHA-pinned and integrity-checked |
| `pnpm test:counts` | 5/5 pass |
| `pnpm test:ids` | 6/6 pass |
| `pnpm test:classification` | 3/3 pass |
| `pnpm test:leaderboard` | 3/3 pass |
| `pnpm test:copy` | 2/2 pass |
| `pnpm test:activity` | 3/3 pass |
| `pnpm test:mock` | 16/16 pass |
| `pnpm test:ask` | 48 queries, 99/99 fields (100%) |
| `pnpm build` | Pass; 1,153 HTML pages; CSP injected into 1,153 files |
| `node scripts/smoke-test.mjs` against local `out/` | Pass (14 routes, IDs, redirects, leaderboard) |
| Playwright, 14 public routes with full header CSP + meta CSP | 200; 0 CSP violations; 0 iframes; charts render; 0 “Sign in” text; 0 `/auth/` links; 0 “Claim Project” text |
| Bookmark/search launch flow | Research-paper bookmark persisted across reload and appeared on `/saved`; project at index 402 found in search; no sign-in prompt |
| Materialized malicious readme (iframe/srcdoc, script, onerror, meta refresh, style, `<details>`, code fence) | No injected iframe/script/meta/onerror; `window.__xss` unset; benign text, code and `<details>` preserved; Prism token spans render |
| CSP direct-injection probe | External iframe blocked; inline `onerror` blocked; `srcdoc` iframe still executes when injected directly — sanitizer remains the primary control |
| `frontend/out` source maps | 0 |
| `out/` mock-session strings | 0 files (`mock-session-token`, `Mock mode`) |
| `pnpm test:artifact` | Pass — 1,153 HTML, 82 JS, 0 maps, 0 mock-session strings, 0 auth links/sign-in/claim copy, CSP/referrer/bootstrap present |
| `out/` CSP-before-script / charset checks | 0 failures across 1,153 HTML files |
| `pnpm audit --prod` | **0 vulnerabilities** |
| `scraper/npm test` | 5/5 pass (timeout, declared/streamed size limits) |
| `scraper/npm audit --omit=dev` | 0 vulnerabilities |
| Secret regex scans (tracked files and `out/`) | No matches |
| `pnpm check:headers` (local header server) | **PASS** — full header policy + meta fallback |
| `pnpm check:headers` (live `https://goha.enoch.et/`) | **FAIL, expected** — headers and even the newly built meta CSP are not deployed; no production changes made |
| Built internal-link crawl | 0 missing targets across 1,153 pages |
| Live headers (`curl -I`) | GitHub Pages/Fastly, no `cf-ray`; no CSP/XFO/nosniff/referrer; `ACAO: *` on public static content |

**Confirmed fixed:** F-01, F-02, F-04, F-05, F-06, F-07, F-08, F-09, F-10,
F-12, F-13, F-14, F-15, F-16, F-17.
**Partially fixed / deployment-dependent:** F-03/F-18 (meta CSP active in the
built artifact; real headers require a host that supports them).
**Observations only:** F-11.
**Dev-only advisories:** remain in `concurrently`, `express`/`msw`,
`@opennextjs/cloudflare`, `wrangler` and `miniflare`; none are in the production
static bundle. The nested `upload-artifact@v4` reference inside the pinned
Pages-artifact action is a supply-chain residual.

## Remaining actions

### Required before a high-assurance production launch (manual approval)

1. **Activate real headers.** Keep GitHub Pages as origin, enable the existing
   Cloudflare proxy for `goha`, set SSL/TLS to Full (strict), and add the
   Response Header Transform Rule in `SECURITY.md`. Verify the Cloudflare edge
   issuer against the CAA policy first. Then run:
   `pnpm check:headers`, the manual **Security baseline** workflow, and a final
   Chromium pass. Rollback is DNS-only/rule removal; no code deploy.
2. **Confirm GitHub Pages custom-domain state** after enabling the proxy and
   redeploy once so the newly built meta CSP reaches production. No DNS change
   is made by this repository.
3. **Review repository secrets.** `HF_TOKEN` and the scraper `GH_TOKEN` should
   be read-only/public-data scoped; `GITHUB_TOKEN` used for the diff issue
   needs only `issues: write`. Rotate on suspicion.

### Recommended soon

1. Enable dependency review / Dependabot for `next`, `postcss`, `zod`,
   `prismjs`, `wrangler` and scraper packages.
2. Consider pinning the nested `actions/upload-artifact@v4` by replacing the
   composite Pages-artifact action with an explicit pinned upload flow.
3. Add a scheduled run of the **Security baseline** workflow once headers are
   active (it currently would fail on the missing production headers).
4. Keep the `pnpm` local/build toolchain on the CI-pinned version (10) if you
   want local frozen installs to match CI; pnpm 12 currently reports the
   approved-build policy differently.

### Ongoing

1. Keep sanitizer, CSP, workflow and scraper HTTP tests in the build.
2. Review scrape diffs for unusual markdown before promoting content.
3. Never commit `.env`; rotate `HF_TOKEN`/`GH_TOKEN` on suspected exposure.
4. Re-run audits, local smoke/browser checks and the header check after
   dependency, workflow or deployment changes.

## Final risk assessment

**Tested:** repository source/configuration, final static build output, 14
content/form routes in Chromium with the full header CSP plus meta CSP,
malicious markdown rendering (including a code fence), CSP behavior, CSV
escaping, production and scraper dependency audits, scraper HTTP-bound tests,
workflow YAML/integrity checks, local smoke tests, mock-session exclusion,
current-tree and `out/` secret patterns, and read-only live response headers.

**Not tested:** real user data (none exists), production authentication (it is
disabled), file uploads (no production service), DNS/TLS/CDN changes (not
authorized), GitHub Actions execution on GitHub (workflow YAML and static
integrity checks passed locally; no push was made), GitHub Actions runtime
secrets, exhaustive Git-history secret scanning, non-Chromium browsers,
aggressive fuzzing or load testing, and the actual Cloudflare Response Header
Transform Rule (not deployed).

**Cannot be verified from the repository alone:** live Cloudflare proxy and
Transform Rule state, HSTS acceptance by browsers, DNS/TLS/CDN settings,
repository secret values and rotation, protected-branch rules, and whether a
future upstream content change introduces a sanitizer bypass.

**Open critical/high findings:** none reachable in the built static runtime.
Production dependency audit is clean; the critical Next.js advisory was
patched and was not reachable in the export. The dead auth gates and search cap
were removed after launch-readiness review. The main residual risk is that
production still runs the old GitHub Pages deployment without real headers or
the newly built meta CSP, plus dev-only toolchain advisories and the inherent
trust placed in upstream metadata (mitigated by sanitization, not eliminated).

**Production verification status:** local build/header simulation passes;
live production header check fails until the approved Cloudflare proxy/rule and
a normal GitHub Pages redeploy are performed. This report does not claim any
header is active merely because it exists in source or a meta tag.
