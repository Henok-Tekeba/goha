# goha.et — The Home of Ethiopian AI

**goha.et** is a curated directory and discovery platform for everything being built in Ethiopian AI. It indexes models, datasets, companies, and research papers across Ethiopian languages (Amharic, Tigrinya, Oromo, Geez, and more) — surfacing them in one place so developers, researchers, and enthusiasts can find, compare, and explore the ecosystem.

The name *goha* (ጎሃ) is an Amharic word meaning "dawn" or "daybreak" — a fitting symbol for the emerging Ethiopian AI landscape.

## Features

- **Browse & Search** — Explore indexed models, datasets, companies, and papers with full-text search and language filtering.
- **Detail Pages** — Dedicated pages for every entity with metadata, statistics, evaluation results, training datasets, and related items.
- **Model Comparison** — Select up to 3 models side-by-side to compare downloads, likes, languages, tags, and more.
- **Trending & Activity** — See what's gaining traction and what's new in the ecosystem at a glance.
- **Quick Start Guides** — Curated entry points for common use cases (ASR, embeddings, text generation).
- **Stats Dashboard** — Track the growth of the Ethiopian AI landscape over time.
- **Dark Mode** — Full dark mode support with system preference detection.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Charts | Recharts |
| Theming | next-themes |
| Language | TypeScript |
| Scraper | Node.js ESM |

## Project Structure

```
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── page.tsx       # Home / explore page
│   │   ├── layout.tsx     # Root layout
│   │   ├── models/[...id] # Model detail pages (SSR)
│   │   ├── datasets/[...id] # Dataset detail pages (SSR)
│   │   ├── companies/[slug] # Company detail pages (SSR)
│   │   ├── papers/[arxivId] # Paper detail pages (SSR)
│   │   ├── stats/         # Analytics dashboard
│   │   └── docs/          # Documentation
│   ├── components/        # React components
│   │   ├── CardGrid.tsx   # Entity card grid with compare mode
│   │   ├── ComparePanel.tsx # Side-by-side comparison panel
│   │   ├── Hero.tsx       # Search and stats hero section
│   │   ├── ModelDetail.tsx # Model detail page UI
│   │   ├── DatasetDetail.tsx # Dataset detail page UI
│   │   ├── CompanyDetail.tsx # Company detail page UI
│   │   └── PaperDetail.tsx # Paper detail page UI
│   ├── lib/
│   │   └── github.ts      # Data fetching from raw GitHub
│   └── types.ts           # TypeScript interfaces
├── scraper/
│   ├── index.mjs          # Main scraper (HF, GitHub, arXiv)
│   ├── build.mjs          # Data normalization and build
│   └── generate-feed.mjs  # Activity feed generator
├── data/                  # Generated data files
│   ├── models.json
│   ├── datasets.json
│   ├── papers.json
│   ├── companies.json
│   └── snapshots/         # Daily snapshots for trend analysis
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/Henok-Tekeba/goha.git
cd goha
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_GH_OWNER=your-github-username
NEXT_PUBLIC_GH_REPO=goha
NEXT_PUBLIC_GH_BRANCH=main
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Data Pipeline

The project uses a multi-source scraper to collect and normalize data:

### Sources

| Source | Data | API |
|---|---|---|
| Hugging Face | Models, datasets, spaces | `huggingface.co/api` |
| GitHub | Repositories, organization repos | `api.github.com` |
| arXiv | Research papers | `export.arxiv.org/api/query` |

### Running the Scraper

```bash
cd scraper
cp .env.example .env
# Add optional API tokens for higher rate limits:
# HF_TOKEN=your_huggingface_token
# GITHUB_TOKEN=your_github_token
npm install
npm start
```

The scraper:
1. Searches HuggingFace for Ethiopian-language models and datasets
2. Enriches models with detailed metadata (parameters, license, evaluation results)
3. Searches GitHub for Ethiopian NLP repositories
4. Queries arXiv for Ethiopian-language research papers
5. Computes growth trends from daily snapshots
6. Generates the activity feed and normalized JSON files under `data/`

### Data Structure

Each entity is normalized into a consistent `Item` format:

```typescript
interface Item {
  name: string;
  org: string;
  badge: string;       // "ASR", "LLM", "Dataset", "Company", etc.
  bc: string;          // Badge CSS class
  _type: string;       // "model" | "dataset" | "company" | "paper"
  dl: number | null;   // Monthly downloads
  lang: string | null; // Primary language
  langs: string[];     // All languages
  desc: string;        // Description
  tags: string[];      // Categorization tags
  growth: number | null; // Download growth %
  verdict: { label: string; icon: string; type: string };
  // ... type-specific fields
}
```

## Deployment

The site is deployed on [Vercel](https://vercel.com). Pushes to the `main` branch trigger automatic redeployment. Data files are served from the repository via `raw.githubusercontent.com`.

### Updating Data

The scraper can be run manually or scheduled via GitHub Actions. Data files are committed to the repository and the frontend fetches them at runtime with server-side caching.

## API

The frontend consumes raw JSON files from the `data/` directory via a simple fetch wrapper:

```
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/models.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/datasets.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/papers.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/companies.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/stats.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/trending.json
GET https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/activity_feed.json
```

## Contributing

We welcome contributions! Here are some ways to help:

- **Add a company** — Submit a PR adding a company entry to `scraper/index.mjs`
- **Improve the scraper** — Add new data sources or improve enrichment logic
- **Enhance the frontend** — Build new features, improve UI/UX, or add tests
- **Report issues** — If data is missing or incorrect, open a GitHub issue

## Roadmap

- [ ] Community submission form for suggesting new entries
- [ ] Automated GitHub Actions scraper pipeline
- [ ] API routes with proper pagination and filtering
- [ ] PWA support with offline capabilities
- [ ] Unit and E2E tests
- [ ] Company detail scraper (currently hardcoded)
- [ ] Space and repository detail pages

## License

MIT

---

Built for the Ethiopian AI community. እንሰራለን! 🇪🇹
