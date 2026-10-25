# goha — Roadmap

> Status: directory v0 (static export, daily snapshots, one grid view).
> Goal: become the living surface of the Ethiopian AI ecosystem — research,
> speech, benchmarks, orgs, and community — in English and Amharic.

Everything below is scoped so it can ship incrementally on the current
architecture (static export + daily scraper commits). Tier 2+ items note where
a real backend (Cloudflare Workers) unlocks them.

---

## Tier 1 — Make it feel alive (surfaces the data we already collect) ✅ SHIPPED

The scraper already gathers more than the UI shows. Ship the missing views.

### 1.1 Live stats band + freshness indicator ✅
- Render `data/stats.json` as a slim band under the hero: `190 models · 210 datasets · 75 papers · 144 spaces · 131 repos · 4 orgs`.
- Compute "updated Xh ago" from the fixture build timestamp (inject at build time in `build-goha-fixtures.mjs`).
- Counts link into their surfaces (models → filter, papers → /research, orgs → /orgs, languages → /lang).
- Latest 3 events ticker under the counts.

### 1.2 Activity feed — "Today in Ethiopian AI" ✅
- `data/activity_feed.json` has 500 events (new model / new dataset / new paper / trending) rendered at `/activity`.
- Grouped feed (Last 48 hours, This week, This month, Earlier), type filter chips, icon-per-type, deep links into detail pages via the entity→project map.
- Homepage: latest 3 events in the stats band.

### 1.3 Research hub (`/research`) ✅
- 75 papers with titles, authors, abstracts, arXiv links; own surface instead of generic project cards.
- Search (title/authors/abstract), language + task filter chips, sort (newest/oldest/A–Z), expandable abstracts.
- Language/task tags derived from abstract text at build time.
- Published dates derived from arXiv ids when the feed lacks them.

### 1.4 Organizations hub (`/orgs`) ✅
- 193 org profiles aggregated from models/datasets/spaces/repos footprints, merged with the curated companies file.
- Org profile pages (`/orgs/[slug]`, statically generated): models, datasets, repos, spaces tabs, stats boxes, language chips, links.
- Companies keep the curated treatment (Addis AI, iCog Labs, EthioNLP, Hasab AI).

### 1.5 Trending board ✅
- `data/stats_insights.json` top gainers render as "Movers this week" on the homepage (6 cards, growth badges, start→end downloads), linking into detail pages.

### 1.6 Quickstart section on homepage
- `data/quickstart.json` holds curated guides ("Need speech-to-text?", "New to Ethiopian AI?"). Render as a compact section above the grid, 3 columns, each item clickable into a pre-filtered view (`/?categories=ASR`).

---

## Tier 2 — What ecosystem people actually use (differentiators)

### 2.1 Speech & benchmarks leaderboard (`/leaderboard`) ✅ SHIPPED
- Voice-first companies live and die by WER/CER. Aggregate every published eval in `models.json` (`wer_score`, `eval_results`) plus papers with benchmark tables (e.g. TeleASR-Amharic).
- Comparative tables per task: Amharic ASR (WER, 4 languages), retrieval accuracy, Tigrinya OCR, QA — best-first ordering.
- Every row links to its source (HF model card) with a cite-back link — never fabricate numbers, only aggregate what is published.
- CSV export per section (this doubles as the seed of the public API).
- Loss metrics and noisy footprint metrics filtered; duplicate model/dataset/metric rows deduped at build.

### 2.2 Language pages (`/lang/[code]`) ✅ SHIPPED
- One canonical page per language (7 live): counts, task-coverage matrix (models × datasets × papers per task), and — the killer section — **gaps**: tasks with zero assets, models with no published eval, assets with no license.
- `/lang` index page lists all languages with counts.
- The gap analysis is the piece researchers and labs quote back.

### 2.3 Scraper: full org coverage
- Add the missing orgs to `scraper/index.mjs` constants: `addisai` (models, not just datasets — today only 2 AddisAI datasets are indexed), `HasabAI`, university/researcher accounts surfaced from the data.
- Model cards: pull `language` tags properly into `confirmed_languages` (currently spotty — `lang: null` on Amharic models).

### 2.4 Entity linking (the knowledge graph)
- Cross-reference: paper ↔ model ↔ dataset ↔ org via IDs in abstracts, `base_model`, `training_datasets`, author overlap, org membership.
- Show "Linked assets" on detail pages: "This paper introduces the dataset used by 3 models".
- Storage is already normalized JSON — this is a build-time join in `build-goha-fixtures.mjs`.

### 2.5 Semantic search
- The cmdk command palette exists — upgrade it to search abstracts + descriptions with embeddings, not just name matching.
- Client-side option: precompute embeddings at fixture build, ship a compact vector blob, cosine in a worker. Works on static hosting.

### 2.6 Submit-a-project flow — frontend shipped
- `/contribute` turns a guided form into a prefilled GitHub issue with a machine-readable JSON block; issue templates cover manual submissions.
- Remaining: scraper ingestion of approved `goha-submit` issues + a community-submitted badge.
- Zero backend, real community loop.

---

## Tier 3 — Dynamic platform + Amharic-first

### 3.1 Migrate to Cloudflare Workers (open-next)
- `wrangler.toml` already exists. Move off pure static export → real `/api/*` routes, ISR-style revalidation, edge caching of fixture JSON.
- Unlocks: live search server-side, per-entity dynamic pages without full rebuilds, real submit endpoints.

### 3.2 Public JSON API + docs page
- `/api/v1/models`, `/api/v1/datasets`, `/api/v1/papers`, `/api/v1/stats`, `/api/v1/leaderboard` — same contract as the fixtures.
- Docs page `/api` with curl examples. A directory with a public API gets forked, cited, and built upon — that's how it becomes infrastructure.

### 3.3 Amharic UI (i18n)
- Translate chrome + landing copy: EN / አማርኛ toggle. A site about Ethiopian languages must read in one.
- Entity descriptions: keep original; add machine-assisted Amharic summaries where licensing allows, clearly labeled.

### 3.4 SEO & sharing
- Auto-generated OG images per entity (title, badge, sparkline, goha brand) via edge-rendered SVG/PNG.
- Complete sitemap (models, datasets, papers, orgs, languages), canonical URLs, JSON-LD (`Dataset`, `ScholarlyArticle`).

---

## Tier 4 — Delighters

- **Goha Weekly**: auto-generated markdown digest of the week's activity (new models, papers, movers) → RSS + newsletter. The ecosystem digest nobody has to write.
- **Ask Goha**: small RAG over titles/abstracts/descriptions ("which models trained on Oromo speech data?") — honest about sourcing, links to entities.
- **Timeline** `/history`: milestones of Ethiopian AI assembled from the data (first models, dataset releases, paper dates).
- **Privacy-friendly analytics** (GoatCounter/Umami) → real traction numbers.
- **Per-entity star/bookmarks** (localStorage now, account-based later).

---

## Data visualizations (shadcn + EvilCharts ECharts) ✅ SHIPPED

Interactive Apache ECharts visualizations via EvilCharts' shadcn-style
components (`src/components/evilcharts/`), themed from the site's CSS tokens:

- **Ecosystem growth** — smooth area chart of indexed models + datasets over
  121 daily snapshots, with the brush dataZoom footer (drag to focus any
  window; drag the plot to pan). Leaderboard page.
- **ASR head-to-head** — horizontal bar chart of published word error rates,
  best at the top, hover-to-dim comparison. Above the ASR table.
- **Who is being used** — stroke-only multi-series trend for the five
  most-used models, brush-zoomable. Leaderboard page.
- **Language coverage radar** — all languages × six tracked tasks in one
  radial comparison; click to isolate a language; empty axes = open problems.
  `/lang` index.
- **Org footprint radar** — an org's publishing shape per channel, normalized
  against ecosystem maxima. Org profile pages.
- **Last-30-days pulse** — daily event-count bars with max-highlight.
  Activity page.
- **What's in the index** — donut of the five asset types. Organizations page.

---

## Sequencing

| Phase | Items | Outcome |
|-------|-------|---------|
| Week 1 | 1.1, 1.2, 1.3, 1.5 | Feels alive: stats, activity, research hub, movers |
| Week 2 | 1.4, 1.6, 2.1, 2.3 | Depth: orgs, quickstart, leaderboard, org coverage |
| Week 3 | 2.2, 2.4, 2.6 | Insight: language pages, knowledge graph, submissions |
| Week 4 | 3.1–3.3, 4 | Platform: workers, public API, Amharic UI |

## Guiding rules

1. **Every number links to its source.** Aggregate, never invent.
2. **Amharic is not decoration.** Translations, search, and labels are part of the product.
3. **The scraper is the product.** The UI is its surface.
4. Ship weekly. The activity feed is proof the ecosystem moves; the roadmap should move too.
