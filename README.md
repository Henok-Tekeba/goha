<div align="center">

# goha

### An open index of Ethiopian AI

A live, source-linked catalogue of the models, datasets, research, organizations and benchmarks being built for Amharic, Afaan Oromo, Tigrinya, Ge'ez and other Ethiopian languages.

[![Live site](https://img.shields.io/badge/live-goha.enoch.et-171717?style=flat-square)](https://goha.enoch.et)
[![Deploy](https://github.com/Henok-Tekeba/goha/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Henok-Tekeba/goha/actions/workflows/deploy-pages.yml)
[![Source](https://img.shields.io/badge/source-GitHub-171717?style=flat-square\&logo=github)](https://github.com/Henok-Tekeba/goha)

[Live site](https://goha.enoch.et) · [Open data](https://goha.enoch.et/api/) · [Contribute](https://goha.enoch.et/contribute/) · [Source](https://github.com/Henok-Tekeba/goha)

</div>

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="goha dashboard showing the hero, ecosystem counts, weekly movers and latest activity" width="100%" />
</p>

## Why goha

Ethiopian AI is built in public, but not in one place. A model lives on Hugging Face, its data on GitHub, its paper on arXiv, and its evaluation inside a model card or a benchmark repo. Counts do not reconcile, metrics do not share a test set, and the gaps stay invisible.

goha answers one question: **what exists for Ethiopian languages, who built it, and what is missing?** It sweeps the public record every day, normalizes it into one catalogue, and derives search, project pages, comparisons, benchmarks, language coverage and a gap report.

It is read-only by design. No account, no database, no API key in the browser. The site is plain HTML and JSON, rebuilt from committed snapshots.

| | |
|---|---|
| **Live** | <https://goha.enoch.et> |
| **Stack** | Next.js 15.5 · React 19 · TypeScript · Tailwind CSS 4 · ECharts 6 |
| **Auth** | None. The watchlist is browser-local. |
| **Database** | None. Committed JSON snapshots. |
| **Deployment** | GitHub Pages via GitHub Actions. |
| **Demo** | Open the live site. No credentials. |

## A day with goha

1. **Check the pulse.** Open the dashboard for counts, freshness, weekly movers and recent events.
2. **Find an asset.** Search, filter by language and task, or ask a plain-language question.
3. **Open the record.** See the model card, languages, license, base model, download history and evaluations.
4. **Compare.** Put up to four models side by side, follow the lineage graph, or read a benchmark table.
5. **Act on a gap.** Open a language page or the gap report, save candidates, and submit missing data.

## Features

- **Daily snapshot** — the index refreshes from Hugging Face, GitHub and arXiv every day.
- **One Project record** — models, datasets, papers and companies share one predictable schema.
- **Search and filters** — language, task, category and sort are shareable in the URL.
- **Ask Goha** — a deterministic parser answers plain-language questions without an LLM.
- **Benchmarks** — published evaluations normalized by task, metric and test set, with CSV export.
- **Lineage and compare** — trace declared `base_model` families and diff up to four models.
- **Language coverage** — eight language pages and a six-task matrix expose empty cells and unmeasured models.
- **Open data and contributions** — JSON endpoints under `/data/`, plus a guided GitHub-issue form.

## Design principles

1. **Cite every number.** A count without a source is a liability.
2. **Aggregate, never invent.** Normalize what authors publish; do not estimate missing metrics.
3. **Static by default.** A read-only index does not need a server or a session store.
4. **The scraper is the product.** The interface is a surface over the pipeline.
5. **Gaps are part of the product.** An empty cell is a finding, not an omission.

## Product screens

| | |
|---|---|
| ![goha browse view with search filters and project cards](docs/screenshots/browse.png) | ![goha project detail page with download history and metadata](docs/screenshots/project.png) |
| **Browse and filter** — every model, dataset and paper in one catalogue. | **Project detail** — model card, languages, license and download history. |

| | |
|---|---|
| ![goha benchmark leaderboard with ecosystem growth chart](docs/screenshots/leaderboard.png) | ![goha research hub with paper list and language filters](docs/screenshots/research.png) |
| **Benchmarks** — published evaluations normalized by task and metric. | **Research** — arXiv papers with authors, abstracts and tags. |

| | |
|---|---|
| ![goha compare view with three models and overlaid download trajectories](docs/screenshots/compare.png) | ![goha Ask Goha result showing published benchmarks for Amharic](docs/screenshots/ask-result.png) |
| **Compare** — up to four models, overlaid trends and a spec diff. | **Ask Goha** — deterministic search with linked results. |

| | |
|---|---|
| ![goha Amharic language page with task coverage and gap analysis](docs/screenshots/amharic.png) | ![goha gap report showing empty cells, unevaluated models and unlicensed assets](docs/screenshots/gaps.png) |
| **Language pages** — coverage and gaps for one language. | **Gap report** — empty cells, unmeasured models and unlicensed assets. |

| | |
|---|---|
| ![goha publishers directory with organization cards](docs/screenshots/orgs.png) | ![goha contribution form for a model, dataset, paper or organization](docs/screenshots/contribute.png) |
| **Publishers** — 184 organizations with public footprints. | **Contribute** — a guided form that opens a structured issue. |

Settings, sign-in and onboarding screens do not exist. goha has no account system; the only local state is the watchlist.

## Auth model

goha has no authentication.

```text
Visitor
  ├── GET / ────────────────► static HTML + JSON (no cookies)
  ├── Save project ─────────► localStorage["goha:saved"]
  └── Submit data ──────────► prefilled GitHub issue
```

- **Accounts:** none. No sign-up, profile, email verification or sessions.
- **Passwords:** none collected, stored or hashed.
- **Isolation:** the watchlist is per-browser and never leaves the device.
- **Auth code:** `src/features/auth` is upstream UI scaffolding. It resolves signed-out and is not routed.

## Architecture

```text
Browser ──► static HTML/CSS/JS + /data/*.json ──► localStorage watchlist
                  ▲
                  │ build time
        Next.js 15 static export (out/)
                  ▲
        scripts/build-goha-fixtures.mjs
                  ▲
        data/db.json + dated snapshots
                  ▲
        scraper: Hugging Face · GitHub · arXiv
                  ▲
        GitHub Actions (daily 06:00 UTC) ──► GitHub Pages
```

Production is the exported `out/` directory on GitHub Pages. There is no production database. `pnpm dev` reads the committed fixtures; `pnpm dev:mock` is a development-only MSW server.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5 App Router, static export |
| UI | React 19, TypeScript 5.9, Tailwind CSS 4 |
| Charts | Apache ECharts 6 |
| Data | Committed JSON, TanStack Query for client surfaces |
| Scraper | Node.js ESM, Hugging Face · GitHub · arXiv |
| Tests | `node:test`, `tsx`, Biome |
| Deploy | GitHub Actions → GitHub Pages |
| Analytics | GoatCounter, optional and cookieless |

## Local setup

Requires Node 22+ and pnpm 10.

```bash
git clone https://github.com/Henok-Tekeba/goha.git
cd goha
pnpm install
pnpm dev
```

Open <http://localhost:3000>. No env file, database or OAuth app required.

## Environment variables

The static site runs without a `.env` file. These are optional:

```bash
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
# NEXT_PUBLIC_GOATCOUNTER_CODE=
# NEXT_PUBLIC_BASE_PATH=
```

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FRONTEND_URL` | Metadata | Canonical and social URLs. Defaults to the live site. |
| `NEXT_PUBLIC_GOATCOUNTER_CODE` | Analytics | Enables GoatCounter. Disabled when unset. |
| `NEXT_PUBLIC_BASE_PATH` | Assets | Subpath hosting only. |
| `HF_TOKEN` / `GITHUB_TOKEN` | Scraper | Optional API rate-limit tokens. Never commit them. |

## Data setup

There is no database. The data layer is committed JSON plus a build-time fixture step.

```bash
cd scraper && npm install && npm start
node scripts/build-goha-fixtures.mjs
```

The scraper writes `data/db.json` and a dated snapshot; the fixture build writes `data/*.mock.*` and `public/data/*.json`. Do not hand-edit generated files. Keep tokens in GitHub secrets or `scraper/.env`.

## OAuth and providers

There is no OAuth provider, client ID, secret or redirect URI. The deployed site has no sign-in route. Adding accounts would require a different backend and security model, not just provider credentials.

## Testing

```bash
pnpm type-check
pnpm test:ask
pnpm test:security
pnpm test:workflows
pnpm build
```

`pnpm build` runs the data, copy, security and artifact gates, then builds over 1,100 static pages. The scraper has its own bounded-HTTP tests (`cd scraper && npm test`).

## Deployment

- Push to `main` or run **Deploy to GitHub Pages** manually.
- `deploy-pages.yml` builds `out/`, uploads the artifact and deploys it.
- A post-deploy smoke test runs against <https://goha.enoch.et>.
- `scrape.yml` refreshes the data daily at 06:00 UTC and triggers a redeploy.
- `public/CNAME` keeps the custom domain.

## Security

- No sessions, passwords, accounts or server-side write endpoints.
- No service keys in the browser; scraper tokens live in CI secrets.
- Third-party markdown is sanitized before rendering.
- The build injects a CSP and `Referrer-Policy: no-referrer`.
- Leaderboard CSV exports neutralize spreadsheet formulas.
- `pnpm test:artifact` rejects source maps, mock-session strings and secret-shaped strings.

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/Henok-Tekeba/goha/security/advisories/new). See [SECURITY.md](SECURITY.md).

## Project structure

```text
src/app/                  Next.js routes
src/features/             ecosystem, projects, contribute, launch-film
src/shared/               layout, UI, hooks, lib, validations
scraper/                  Hugging Face · GitHub · arXiv sweep
scripts/                  fixtures, checks, smoke test
data/                     raw snapshots and generated fixtures
public/data/              client-facing JSON
docs/screenshots/         README screenshots
.github/workflows/        scrape, deploy, security
```

## Roadmap and status

**Status:** v0.2.0, live and rebuilt daily.

| Area | Status |
|---|---|
| Dashboard, search, project pages, research, benchmarks | Shipped |
| Lineage, compare, Ask Goha, languages, gaps, organizations | Shipped |
| Watchlist, contributions, open data, daily deploy | Shipped |
| Full org coverage, entity linking, submission ingestion | Next |
| Semantic search, Cloudflare Workers, public API, Amharic UI | Planned |

See [ROADMAP.md](ROADMAP.md) and [AUDIT.md](AUDIT.md).

The index is not complete: it reflects public APIs, not a census. The leaderboard aggregates published numbers and does not re-run models. Counts in this README are a snapshot; `/data/stats.json` is authoritative.

## Source and license

- **Source:** <https://github.com/Henok-Tekeba/goha>
- **Live:** <https://goha.enoch.et>
- **Open data:** <https://goha.enoch.et/api/>
- **Security:** [SECURITY.md](SECURITY.md)
- **Contributions:** use <https://goha.enoch.et/contribute/> or the issue templates.

`scraper/`, `data/`, `scripts/` and generated JSON are **MIT** ([LICENSE-MIT](LICENSE-MIT)). `src/` and `content/` are **CC BY-NC 4.0**, © OpenSource Together ([LICENSE.md](LICENSE.md)). Upstream models, datasets and papers keep their own licenses.

---

<div align="center">

**goha** · ጎሃ · [goha.enoch.et](https://goha.enoch.et)

</div>
