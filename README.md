# goha.et — The Home of Ethiopian AI

**goha.et** (ጎሃ — "dawn" in Amharic) is a curated directory and discovery platform for the Ethiopian AI ecosystem. It indexes models, datasets, companies, and research papers across Ethiopian languages (Amharic, Tigrinya, Oromo, Geez, and more) — surfacing everything in one place so developers, researchers, and enthusiasts can find, compare, and explore.

## Features

- **Browse & Search** — Full-text search and language filtering across all entities.
- **Detail Pages** — Dedicated pages with metadata, stats, evaluations, training data, and related items.
- **Model Comparison** — Compare up to 3 models side-by-side on downloads, likes, languages, tags, and more.
- **Trending & Activity** — See what's gaining traction and what's new in the ecosystem.
- **Quick Start Guides** — Curated entry points for common use cases (ASR, embeddings, text generation).
- **Stats Dashboard** — Track the growth of the Ethiopian AI landscape over time.
- **Dark Mode** — Full dark mode with system preference detection.

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
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx          # Home / explore
│   │   ├── layout.tsx        # Root layout
│   │   ├── models/[...id]    # Model detail (SSR)
│   │   ├── datasets/[...id]  # Dataset detail (SSR)
│   │   ├── companies/[slug]  # Company detail (SSR)
│   │   ├── papers/[arxivId]  # Paper detail (SSR)
│   │   ├── stats/            # Analytics dashboard
│   │   └── docs/             # API documentation
│   ├── components/           # React components
│   │   ├── CardGrid.tsx      # Entity card grid with compare mode
│   │   ├── ComparePanel.tsx  # Side-by-side comparison panel
│   │   ├── Hero.tsx          # Search and stats hero section
│   │   ├── ModelDetail.tsx   # Model detail UI
│   │   ├── DatasetDetail.tsx # Dataset detail UI
│   │   ├── CompanyDetail.tsx # Company detail UI
│   │   └── PaperDetail.tsx   # Paper detail UI
│   ├── lib/
│   │   └── github.ts         # Data fetching from raw GitHub
│   └── types.ts              # TypeScript interfaces
├── scraper/
│   ├── index.mjs             # Scraper (HF, GitHub, arXiv)
│   ├── build.mjs             # Data normalization and build
│   └── generate-feed.mjs     # Activity feed generator
├── data/                     # Generated data files
│   ├── models.json
│   ├── datasets.json
│   ├── papers.json
│   ├── companies.json
│   └── snapshots/            # Daily snapshots for trend analysis
└── public/                   # Static assets
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

The scraper collects and normalizes data from multiple sources:

| Source | Data | API |
|---|---|---|
| Hugging Face | Models, datasets, spaces | `huggingface.co/api` |
| GitHub | Repositories, organization repos | `api.github.com` |
| arXiv | Research papers | `export.arxiv.org/api/query` |

### Running the Scraper

```bash
cd scraper
cp .env.example .env
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
  badge: string;          // "ASR", "LLM", "Dataset", "Company", etc.
  bc: string;             // Badge CSS class
  _type: string;          // "model" | "dataset" | "company" | "paper"
  dl: number | null;      // Monthly downloads
  lang: string | null;    // Primary language
  langs: string[];        // All languages
  desc: string;           // Description
  tags: string[];         // Categorization tags
  growth: number | null;  // Download growth %
  verdict: { label: string; icon: string; type: string };
  // ... type-specific fields
}
```

## Deployment

Deployed on [Vercel](https://vercel.com). Pushes to `main` trigger automatic redeployment. Data files are served from the repository via `raw.githubusercontent.com`.

The scraper runs manually or via GitHub Actions. Data files are committed to the repository and fetched at runtime with server-side caching.

## API

The frontend consumes raw JSON files from `data/`:

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

- **Add a company** — Submit a PR with a company entry in `scraper/index.mjs`
- **Improve the scraper** — Add new data sources or enrichment logic
- **Enhance the frontend** — Build new features, improve UI/UX, or add tests
- **Report issues** — Open a GitHub issue for missing or incorrect data

## License

MIT

---

Built for the Ethiopian AI community. እንሰራለን! 🇪🇹
