# goha.et — The Home of Ethiopian AI

**goha.et** (ጎሃ — "dawn" in Amharic) is a curated directory and discovery platform
for the Ethiopian AI ecosystem — models, datasets, companies, and research papers
for Amharic, Afaan Oromo, Tigrinya, Ge'ez and more.

## Ecosystem surfaces

Beyond the discovery grid, goha renders the data its pipeline already collects:

- **Stats band** — live counts + index freshness, homepage
- **Movers** — weekly download gainers, homepage
- **`/activity`** — every new model, dataset, paper and milestone, daily
- **`/research`** — the paper index: search, language/task filters, abstracts
- **`/leaderboard`** — comparative published results (ASR WER, retrieval, OCR) with CSV export; every row cites its source
- **`/orgs`** — companies, labs and builders with full public footprints (193 profiles)
- **`/lang/[language]`** — per-language coverage maps and gap analysis (7 languages)

## Architecture

The frontend is an adaptation of [OpenSource Together](https://opensource-together.com)'s
site (their excellent discovery UI), rendering **goha's own data**:

```
scraper/            goha's pipeline (Hugging Face · GitHub · arXiv)
   └─ npm start     → data/*.json (models, datasets, companies, papers, feeds)
scripts/build-goha-fixtures.mjs   (goha data → OST data-layer contract + ecosystem surfaces)
src/                OST frontend (unchanged UI, goha branding + data)
data/               daily snapshots, served as the source of truth
public/data/        client-facing static JSON (projects, taxonomy, activity,
                    stats, insights, orgs, papers, leaderboard, languages)
```

Every scrape ends with `node scripts/build-goha-fixtures.mjs`, which converts
goha's normalized JSON into the frontend's `Project` contract — so the UI is
pixel-identical to the original design while every list, filter, and card is
powered by goha.et data. The same script emits the ecosystem JSON surfaces
above (into `public/data/`, fetched client-side, and into `src/mocks/fixtures/`
for build-time joins like org static params).

## Development

Requires Node 22+ and pnpm.

```bash
pnpm install
pnpm dev:mock        # frontend on :3000 + goha-data mock API on :4000
```

The mock backend serves goha's fixture data (generated from `data/*.json`) and
the full OST API contract, including the demo auth session.

## Production pipeline

1. `scraper` runs daily (GitHub Actions) and commits `data/*.json`
2. `scripts/build-goha-fixtures.mjs` regenerates the frontend data layer
3. The app deploys on Vercel; data updates ship with the next commit

## Attribution

Frontend design & code adapted from
[OpenSource Together](https://github.com/opensource-together/opensource-together)
(`src/`, design system, learn content), licensed **CC BY-NC 4.0** — this
project remains non-commercial. goha's scraper, data pipeline, and datasets are
original work. See `LICENSE.md` for the upstream license text.

## License

- `scraper/`, `data/`, `scripts/build-goha-fixtures.mjs` — MIT (goha.et)
- `src/` and `content/` — CC BY-NC 4.0, © OpenSource Together

---

እንሰራለን! 🇪🇹
