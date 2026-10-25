# goha — The Home of Ethiopian AI

**Live at [goha.enoch.et](https://goha.enoch.et)**

**goha** (ጎሃ — "dawn" in Amharic) is a live index of the Ethiopian AI
ecosystem — models, datasets, research papers, organizations and benchmarks for
Amharic, Afaan Oromo, Tigrinya, Ge'ez and more.

It is a fully static site rebuilt every day from the public record: Hugging
Face, GitHub and arXiv. No database, no backend, no API keys — just a data
pipeline and a careful interface on top of it.

---

## Features

### Discovery

- **Landing dashboard** — ecosystem stats with freshness, weekly movers,
  most-used models, latest research, language tiles and an activity preview.
  The full catalogue lives behind search and filters, paginated 12 per page —
  no endless scroll.
- **Project cards** — type icon (waveform for speech, chip for LLMs, table for
  datasets…), title, organization, an honest one-line description, and one
  quiet stats row: downloads, likes, language, license.
- **Search & filters** — language, task, sort, all reflected in the URL and
  shareable. Model pages render their Hugging Face model card, evaluation
  tables, declared languages and metadata.

### Research

- **`/research`** — every arXiv paper the sweep finds, with authors, abstracts,
  language and task tags, search, and expandable abstracts.
- **`/leaderboard`** — published evaluation results aggregated from model
  cards: ASR word error rates across Amharic, Afaan Oromo, Tigrinya and Ge'ez,
  retrieval accuracy, OCR. Every row links to its source; loss metrics and
  incomparable numbers are filtered out. CSV export per section.
- **`/lineage`** — the family tree of Ethiopian AI. Every model card's
  `base_model` is resolved into a genealogy (Llama → Amharic Llama → instruct
  tune), drawn as an interactive graph with family filters, pan/zoom and
  click-through to each model.
- **`/compare`** — put up to four models side by side: overlaid download
  trajectories and a spec diff (task, languages, license, parameters, base
  model, freshness). Shareable URLs.

### Ask Goha

- **`/ask`** — natural-language search over the index: *"Tigrinya speech
  models"*, *"What's missing for Oromo?"*, *"Amharic LLMs under 2B"*.
- Deterministic by design: a rule-based parser maps the question to language,
  task, entity type and constraints, then answers from the structured data —
  **no LLM, no embeddings, no API calls, no cost**. When it cannot map a
  question it says so and shows the closest matches instead of inventing an
  answer.
- Accuracy is measured, not claimed: **100% field accuracy on a 48-query
  evaluation set** covering the supported vocabulary (`pnpm test:ask`).
  Free-form prose outside that vocabulary is the known limitation.

### The Gap Report

- **`/gaps`** — a data-cited report on what the ecosystem is missing: empty
  language × task cells, the most-downloaded models with no published
  evaluation, assets without licenses, and tasks where research exists but no
  usable model or dataset does. Recomputed on every scrape.

### Open data & about

- **`/api`** — every surface is backed by a static JSON file under `/data/`;
  the page documents each endpoint, shows `curl`/`jq` recipes and the `Project`
  schema, with honest caveats about freshness and derived tags.
- **`/about`** — why goha exists, how the pipeline works, the principles, what
  it deliberately does not do, and who built it.

### Ecosystem surfaces

- **`/orgs`** — 190+ organizations with aggregated public footprints
  (models, datasets, repos, spaces), curated company records, and a footprint
  radar per profile.
- **`/lang`** — per-language coverage maps: assets per task, plus a derived
  **gap analysis** ("no TTS datasets for Ge'ez", "N of M models have no
  published evaluation").
- **`/activity`** — every new model, dataset, paper and milestone, grouped by
  recency, with a 30-day pulse chart.
- **`/projects/[id]`** — the full record: interactive ECharts download history,
  model card, evaluations, languages, and a Compare link.

### Visualizations

Interactive Apache ECharts charts via EvilCharts-style shadcn components
(`src/components/evilcharts/`), themed from the site's CSS tokens:

| Chart | Where |
|---|---|
| Ecosystem growth (area + brush zoom) | `/leaderboard` |
| ASR head-to-head (horizontal bars) | `/leaderboard` |
| Top-model download trends (multi-series) | `/leaderboard` |
| Language coverage radar | `/lang` |
| Organization footprint radar | `/orgs/[slug]` |
| Asset-type donut | `/orgs` |
| 30-day activity pulse | `/activity` |
| Model lineage graph | `/lineage` |
| Download history (per model) | `/projects/[id]` |
| Overlaid comparison chart | `/compare` |

---

## Architecture

```
scraper/                  goha's pipeline (Hugging Face · GitHub · arXiv)
   └─ npm start           → data/*.json  (daily snapshots + current state)
scripts/build-goha-fixtures.mjs
   ├─ src/mocks/fixtures/  build-time joins (projects, orgs, papers, languages)
   └─ public/data/         client-facing JSON (fetched by the browser)
src/                      Next.js 15 app (static export)
out/                      deployable static site (GitHub Pages)
```

Every scrape ends with `node scripts/build-goha-fixtures.mjs`, which:

1. converts the scraped JSON into the frontend's `Project` contract
   (the UI is adapted from [OpenSource Together](https://opensource-together.com));
2. derives the ecosystem surfaces — activity feed, stats, movers, org
   footprints, paper index, leaderboard, language coverage, growth history and
   the model lineage graph — and writes them to `public/data/`;
3. writes build-time fixtures used for static params and server-side joins.

The landing dashboard (`/`) is prerendered from those files at build time, so
its content is in the initial HTML. Only the filter bar and the filtered browse
view are client-side.

### Data files (`public/data/`)

| File | Contents |
|---|---|
| `projects.json` | all entities in the UI contract (models, datasets, companies, papers) |
| `taxonomy.json` | categories + tech/language stacks |
| `stats.json` | counts, index freshness, featured model |
| `activity.json` | recent ecosystem events |
| `insights.json` | weekly download movers, most downloaded |
| `orgs.json` | organization footprints and curated company records |
| `papers.json` | research records with derived language/task tags |
| `leaderboard.json` | normalized published evaluations by task |
| `languages.json` | language index (name, slug, glyph) |
| `language-coverage.json` | language × task matrix |
| `growth.json` | daily model/dataset counts from every snapshot |
| `top-models-history.json` | download history of the five most-used models |
| `lineage.json` | nodes, edges, families and layout for the family tree |

### Routes

| Route | Purpose |
|---|---|
| `/` | dashboard (or paginated browse when filters are active) |
| `/projects/[id]` | project detail |
| `/research` | paper index |
| `/leaderboard` | benchmarks & rankings |
| `/lineage` | model family tree |
| `/compare` | side-by-side model comparison |
| `/ask` | natural-language search |
| `/orgs`, `/orgs/[slug]` | organization directory and profiles |
| `/lang`, `/lang/[slug]` | language index, coverage and gaps |
| `/activity` | ecosystem feed |
| `/gaps` | the gap report — empty cells, unmeasured models, licensing |
| `/about` | mission, pipeline, principles, non-goals |
| `/api` | open data: endpoints, examples, schema, caveats |

### Community submissions

`/contribute` turns a guided form into a prefilled GitHub issue (with a
machine-readable JSON block). Create these labels in the repository so
submissions land in the right queue:

- `goha-submit` — models, datasets, papers and organizations
- `goha-correction` — data corrections
- `goha-benchmark` — evaluation results
- `feedback` — product feedback

The form and issue templates live in `src/features/contribute/` and
`.github/ISSUE_TEMPLATE/`. `/creators` holds the ready-to-post creator kit.

### Deploy

- `.github/workflows/scrape.yml` — daily scrape, fixture regeneration, commit
- `.github/workflows/deploy-pages.yml` — static build and GitHub Pages deploy

---

## Development

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # static export → out/
pnpm type-check
pnpm lint
pnpm test:ask       # Ask Goha parser evaluation (48 queries)
pnpm test:mock      # mock API contract tests
```

The scraper can be run separately:

```bash
cd scraper
npm install
npm start           # writes data/*.json (HF_TOKEN / GITHUB_TOKEN recommended)
```

After scraping, regenerate the frontend data:

```bash
node scripts/build-goha-fixtures.mjs
```

---

## Principles

1. **Every number links to its source.** Aggregate, never invent.
2. **Amharic is not decoration.** Languages, scripts and names are first-class.
3. **The scraper is the product.** The UI is its surface.
4. **No LLM required.** Ask Goha is deterministic, inspectable and free; the
   retrieval layer is ready if a model is ever added on top.

---

## Attribution

Frontend design & code adapted from
[OpenSource Together](https://github.com/opensource-together/opensource-together)
(`src/`, design system, learn content), licensed **CC BY-NC 4.0** — this
project remains non-commercial. goha's scraper, data pipeline, datasets and
ecosystem surfaces are original work. See `LICENSE.md` for the upstream
license text.

## License

- `scraper/`, `data/`, `scripts/build-goha-fixtures.mjs` — MIT (goha)
- `src/` and `content/` — CC BY-NC 4.0, © OpenSource Together

---

እንሰራለን! 🇪🇹
