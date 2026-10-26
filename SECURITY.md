# Security

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Report it
privately to the maintainer, Henok Tekeba, through GitHub's private
vulnerability reporting on
[Henok-Tekeba/goha](https://github.com/Henok-Tekeba/goha/security/advisories/new),
or by direct message to [@HenokTekeba](https://x.com/HenokTekeba). Include the
affected route or file, reproduction steps, and the impact you believe is
possible. Do not include real user data, credentials, or secrets in a report.

## What this application is

goha is a **read-only static export** deployed to GitHub Pages. It has no
database, server runtime, API keys, payment flow, or production
authentication. Public auth/onboarding/dashboard/profile routes were removed;
saved projects are stored in the visitor's browser. The local mock API is a
development-only tool.

The daily scraper pulls public metadata and model cards from Hugging Face,
GitHub and arXiv, then commits JSON fixtures. Legacy redirects are only emitted
when their target still exists in the current fixture. That means the main trust
boundary is **third-party content rendered in a visitor's browser**.
Descriptions, model cards, READMEs, code-of-conduct files and issue bodies
must be treated as untrusted.

## Implemented controls

- Raw HTML in third-party markdown is parsed, then sanitised with the
  GitHub-style `rehype-sanitize` allowlist before React renders it. Scripts,
  iframes, forms, style/meta/base tags, event handlers and active URL schemes
  are removed. See `src/shared/lib/markdown.ts`.
- Every `ReactMarkdown` instance is covered by a regression test that fails
  if a new instance bypasses the shared sanitised plugin lists.
- A Content Security Policy is injected at the beginning of every exported
  page's `<head>` during `pnpm build`. It blocks external scripts, external
  frame loads, plugins, cross-origin form posts and inline event handlers,
  while allowing the site's own chunks and the optional Goatcounter analytics
  host.
- `Referrer-Policy` is set to `no-referrer`; markdown images are lazy,
  async-decoded and use `no-referrer`.
- Production browser source maps are disabled. `pnpm test:artifact` also
  fails the build if maps, mock-session strings, missing CSP/referrer metadata,
  incorrect charset placement or secret-shaped strings appear in `out/`.
- Leaderboard CSV exports neutralise spreadsheet formulas (CSV injection).
- Saved projects use a browser-local watchlist (`localStorage`) at `/saved`;
  there is no sign-in gate and no server-side bookmark storage. Formula and
  project-id parsing are bounded; see `src/shared/lib/bookmarks.ts`.
- External links opened in a new tab use `noopener noreferrer`.
- The direct Next.js dependency is kept on a patched release; the scraper's
  XML parser is kept patched as well. Production dependency audit is clean
  (`pnpm audit --prod`), with compatible overrides for Next's PostCSS/
  source-map-js graph, Prism 1.30, and Zod 4.6.7. Dev-only toolchain
  advisories are tracked separately and are not in the deployed bundle.
- Zod 4's optional JIT compiler is disabled before application chunks load so
  form validation works under the no-`unsafe-eval` CSP.
- The dev-only mock-session toggle is replaced by a no-op module in production;
  `mock-session-token` does not appear in the exported chunks.
- Generated taxonomy source uses JSON escaping; generated fixtures are data,
  not executable content.
- Scraper HTTP calls have a 30 s timeout and 10 MiB response cap; subprocesses
  use `execFileSync` with argument arrays rather than shell command strings.
- All GitHub Actions are pinned to full commit SHAs. Workflows use
  least-privilege permissions, no PR trigger can reach secrets, deployments
  use the tested build artifact, and builds/scrapes install from lockfiles.

## Upstream ingestion and CI

The scraper only fetches fixed registry/API hosts, with the repo id encoded as
URL path segments. Bounded responses and timeouts prevent a single upstream
response from hanging the job. The daily scrape runs only on a schedule or
manual dispatch; it is never triggered by a fork pull request. It receives
`HF_TOKEN` and a separate `GH_TOKEN`; the default `GITHUB_TOKEN` is only used
for the disappeared-record issue. The scrape job can write only data fixtures
and issue reports, and the commit step stages only `data/` and generated
`public/` directories.

`pnpm test:security` covers markdown sanitization, CSP policy invariants,
CSV formula escaping, and the Zod jitless form contract. `pnpm test:bookmarks`
covers the local watchlist parser/toggle. Browser verification of the exported
site covers the absence of sign-in/auth links and the full-index search flow;
the artifact check covers maps, mock-session code, auth/claim links and
security metadata. `pnpm test:workflows` rejects unpinned actions, unsafe PR
triggers, secret interpolation into shell commands, non-frozen installs, and a
broken build→artifact→deploy chain. Scraper tests cover bounded responses and
timeouts (`npm test` in `scraper/`).

## Production headers

### Current state

GitHub Pages serves `goha.enoch.et` directly and cannot send custom response
headers. The build injects a CSP and `Referrer-Policy` as `<meta>` tags so the
site has a baseline even on the GitHub origin. A meta policy cannot express
`frame-ancestors`, `report-uri`, or `sandbox`, and browsers may still honour
`iframe srcdoc` in ways a policy should not be relied on to prevent. The
markdown sanitizer is the primary XSS control; CSP is defence in depth.

`enoch.et` is delegated to Cloudflare nameservers. `goha.enoch.et` currently
resolves by CNAME to `henok-tekeba.github.io` and is **not proxied** (responses
come directly from GitHub/Fastly). That makes Cloudflare a low-change place to
add headers without moving the site or changing the deployment pipeline.

### Recommended architecture (requires approval)

Keep GitHub Pages as the origin. Enable Cloudflare's proxy for the existing
`goha` record and add one response-header rule. This preserves the domain, the
static export, the GitHub Actions build/deploy, and the certificate already
issued to GitHub Pages. No application code or DNS target needs to change.

Preconditions to verify before enabling the proxy:

1. Cloudflare is authoritative for `enoch.et` (currently
   `sneh.ns.cloudflare.com` / `louis.ns.cloudflare.com`).
2. The `goha.enoch.et` certificate is valid (currently Let's Encrypt, valid to
   2027-01-21).
3. Cloudflare's edge certificate can be issued under the domain's CAA policy.
   Current CAA allows Let's Encrypt, DigiCert and Sectigo. If the edge issuer
   is Google Trust Services, add the appropriate `pki.goog` CAA record **only
   with DNS-change approval**; otherwise proxy enablement could fail TLS.
4. GitHub Pages' custom domain remains `goha.enoch.et` and `public/CNAME` stays
   in the repository.

Exact steps:

1. In Cloudflare → `enoch.et` → DNS, set the existing `goha` CNAME to
   `henok-tekeba.github.io` with **Proxy status: Proxied** (orange cloud).
   Keep the same target; do not create a new hostname.
2. Set SSL/TLS → Overview to **Full (strict)**. Do not use Flexible; it can
   create a redirect loop with GitHub Pages and sends no TLS to the origin.
3. Enable **Always Use HTTPS** if it is not already on. Disable Rocket Loader
   and other HTML/script rewriting features for this hostname; they can inject
   scripts that conflict with the CSP or change tested behavior.
4. Create Rules → Transform Rules → **Modify Response Header**:
   - Name: `goha security headers`
   - When: `hostname eq "goha.enoch.et"` (or `http.host eq`)
   - Set the static headers from `SECURITY_RESPONSE_HEADERS` in
     `src/config/security.ts`:

```http
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none'; form-action 'self'; img-src 'self' data: blob: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://gc.zgo.at; script-src-attr 'none'; connect-src 'self' https://*.goatcounter.com; media-src 'self' blob: data:; worker-src 'self' blob:; manifest-src 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)
```

The header CSP deliberately starts with the same directives as the meta CSP
and adds `frame-ancestors 'none'`. Both policies are enforced as an
intersection; no directive is relaxed. The meta tag remains as a fallback for
direct-origin access and for hosts that ignore headers. Do not add
`unsafe-eval`; `unsafe-inline` in `script-src` is required by Next.js's inline
bootstrap scripts in a static export. `img-src https:` is intentionally broad
because README images may be hosted anywhere; it is an image-only allowance.
`connect-src https://*.goatcounter.com` is scoped to the optional analytics
service.

5. HSTS scope: `includeSubDomains` applies only to subdomains of
   `goha.enoch.et` (there are none). Do **not** add `preload`, and do not set
   this header on the `enoch.et` apex or unrelated subdomains without a
   separate HTTPS/domain review.

### Verification and rollback

```bash
pnpm build
pnpm preview:headers          # serves out/ with the exact header policy
pnpm check:headers http://127.0.0.1:8090/
pnpm check:headers            # live check; fails until the edge rule is active
```

`pnpm check:headers` inspects the actual HTTP response and also confirms the
meta fallback exists; it does not treat source code or a meta tag as proof that
a header is live. It checks `frame-ancestors 'none'`, `script-src-attr 'none'`,
`object-src 'none'`, absence of `unsafe-eval`, HSTS max-age/includeSubDomains,
and the other response headers.

Rollback is non-destructive: remove the Transform Rule and set the DNS record
back to DNS-only. No deploy or code revert is required. If the Cloudflare plan
does not include Response Header Transform Rules, a small Worker on the same
proxied hostname can set the identical headers; the origin and domain remain
unchanged.

### Verification status

Local `pnpm build` injects the meta CSP into all 1,174 HTML files, and
`pnpm preview:headers` + `pnpm check:headers http://127.0.0.1:8090/` passes the
full header policy. Chromium runs across content and form routes showed no CSP
violations, no iframes, working charts, and a rendering form page. The live check is expected to
fail until the proxy rule is approved and a normal Pages redeploy ships the
new build; no production header or DNS change has been made.

If proxying is not approved, the alternative is to move to a static host that
supports `_headers`/response headers (Cloudflare Pages or Netlify). That changes
the deploy target and custom-domain routing, so it needs a separate migration
decision; it is not the recommended first step because Cloudflare is already
the DNS provider.

## Secrets and CI

The deploy workflow uses only the GitHub-provided Pages token and no
application secrets. The daily scrape uses `HF_TOKEN` and `GH_TOKEN` from
repository secrets. Keep them scoped to the scrape workflow, rotate them if
they are ever exposed, and never commit `.env` files (only `.env.example` is
tracked).

## Out of scope

- Correctness, attribution, licensing and completeness of third-party data.
- Denial-of-service testing against production or GitHub Pages.
- The private backend/mock API beyond the local development environment.
