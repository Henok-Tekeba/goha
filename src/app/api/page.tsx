import type { Metadata } from "next";
import Link from "next/link";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";

export const metadata: Metadata = {
  title: "Open data & API",
  description:
    "Every surface on goha is backed by a public JSON file. No key, no auth, rebuilt daily from Hugging Face, GitHub and arXiv.",
  alternates: { canonical: "/api" },
};

const ENDPOINTS: { path: string; what: string; shape: string }[] = [
  {
    path: "/data/projects.json",
    what: "Every entity in one contract: models, datasets, companies, papers.",
    shape: "Project[]",
  },
  {
    path: "/data/papers.json",
    what: "Research index with derived language and task tags.",
    shape: "{ data: Paper[] }",
  },
  {
    path: "/data/orgs.json",
    what: "Organization footprints merged with curated company records.",
    shape: "{ data: Org[] }",
  },
  {
    path: "/data/leaderboard.json",
    what: "Published evaluations normalized per task, best first.",
    shape: "{ sections: Section[] }",
  },
  {
    path: "/data/stats.json",
    what: "Counts, index freshness and the featured model.",
    shape: "Stats",
  },
  {
    path: "/data/activity.json",
    what: "Recent ecosystem events with entity links.",
    shape: "{ data: Event[] }",
  },
  {
    path: "/data/insights.json",
    what: "Weekly download movers and most-downloaded models.",
    shape: "Insights",
  },
  {
    path: "/data/languages.json",
    what: "Language index — name, slug and script glyph.",
    shape: "{ data: Language[] }",
  },
  {
    path: "/data/language-coverage.json",
    what: "Language × task matrix used by the radar and gap report.",
    shape: "{ rows, languages, tasks }",
  },
  {
    path: "/data/growth.json",
    what: "Daily model/dataset counts from every snapshot.",
    shape: "{ data: GrowthPoint[] }",
  },
  {
    path: "/data/top-models-history.json",
    what: "Download history of the five most-used models.",
    shape: "{ rows, series }",
  },
  {
    path: "/data/lineage.json",
    what: "Model family tree — nodes, edges, families, layout.",
    shape: "{ nodes, links, families }",
  },
  {
    path: "/data/taxonomy.json",
    what: "Categories and language/tech stacks used by filters.",
    shape: "{ categories, techStacks }",
  },
];

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-[12px] border border-muted-black-stroke bg-secondary/40 px-4 py-3 text-[12px] text-primary leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export default function ApiPage() {
  return (
    <>
      <main>
        <div className="mx-auto max-w-4xl px-6">
          <header className="mb-10">
            <p className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-[0.08em]">
              Open data
            </p>
            <h1
              className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              The index, as JSON
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Every page on goha is rendered from static JSON files under{" "}
              <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">
                /data/
              </code>
              . There is no API key, no auth and no rate limit — the same files
              the site fetches are the ones you can read. They are rebuilt by
              the daily scrape, so everything here is a snapshot, not a live
              stream.
            </p>
          </header>

          <section className="mb-12" aria-labelledby="endpoints-heading">
            <h2
              id="endpoints-heading"
              className="mb-3 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Endpoints
            </h2>
            <div className="overflow-x-auto rounded-[16px] border border-muted-black-stroke bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-muted-black-stroke border-b text-left text-muted-foreground text-xs">
                    <th className="px-4 py-2.5 font-medium">Path</th>
                    <th className="px-4 py-2.5 font-medium">What it holds</th>
                    <th className="px-4 py-2.5 font-medium">Shape</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((endpoint) => (
                    <tr
                      key={endpoint.path}
                      className="border-muted-black-stroke border-b last:border-b-0"
                    >
                      <td className="px-4 py-2.5 align-top">
                        <code className="text-[12px] text-primary">
                          {endpoint.path}
                        </code>
                      </td>
                      <td className="px-4 py-2.5 align-top text-muted-foreground text-xs">
                        {endpoint.what}
                      </td>
                      <td className="px-4 py-2.5 align-top">
                        <code className="text-[11px] text-muted-foreground">
                          {endpoint.shape}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12" aria-labelledby="examples-heading">
            <h2
              id="examples-heading"
              className="mb-3 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Examples
            </h2>
            <p className="mb-3 text-muted-foreground text-xs">
              Read the freshness of the index:
            </p>
            <Code>
              {"curl -s https://goha.enoch.et/data/stats.json | jq .counts"}
            </Code>
            <p className="mt-5 mb-3 text-muted-foreground text-xs">
              Filter Amharic speech models with jq:
            </p>
            <Code>{`curl -s https://goha.enoch.et/data/projects.json \\
  | jq '[.[] | select(
      (.projectCategories[1].name // "") == "ASR"
      and ((.repositoryDetails.languages // []) | index("Amharic"))
    ) | { title, downloadsMonthly, repoUrl }]'`}</Code>
            <p className="mt-5 mb-3 text-muted-foreground text-xs">
              Pull published ASR results as CSV:
            </p>
            <Code>{`curl -s https://goha.enoch.et/data/leaderboard.json \\
  | jq -r '.sections[] | select(.task=="ASR")
      | .rows[] | [.model, .org, .metric, .display, .dataset]
      | @csv'`}</Code>
          </section>

          <section className="mb-12" aria-labelledby="schema-heading">
            <h2
              id="schema-heading"
              className="mb-3 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              The Project shape
            </h2>
            <p className="mb-3 text-muted-foreground text-xs">
              <code className="text-[11px]">projects.json</code> is the one
              contract everything else renders from. The goha-specific fields
              are additive to the original open-source schema:
            </p>
            <Code>{`{
  "id": "pjt_…",
  "title": "wav2vec2-large-xlsr-53-amharic",
  "description": "Speech recognition model for Amharic.",
  "owner": { "name": "agkphysics" },
  "projectCategories": [{ "name": "Model" }, { "name": "ASR" }],
  "repositoryDetails": {
    "stars": 5,
    "license": "mit",
    "languages": ["Amharic"],
    "readme": "<base64 model card>"
  },
  "downloadsMonthly": 73007,
  "growth": 30,
  "sparkline": { "points": [ … ], "timestamps": [ … ] },
  "evaluations": [ … ],      // published metric tables
  "baseModel": "…",          // lineage edge
  "paramCount": 315678570
}`}</Code>
          </section>

          <section className="mb-16 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-4">
            <h2 className="font-medium text-primary text-sm tracking-tight">
              Honest caveats
            </h2>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-muted-foreground text-xs leading-relaxed">
              <li>
                These are static files. Freshness is the scrape cadence — check{" "}
                <code className="text-[11px]">stats.json → indexedAt</code>.
              </li>
              <li>
                Language and task tags are derived from model-card metadata and
                names, not authored by us; the derivation is documented on{" "}
                <Link href="/gaps" className="underline underline-offset-4">
                  the gap report
                </Link>
                .
              </li>
              <li>
                Hosting is GitHub Pages. Server-side fetches always work; for
                browser fetch from another origin, check the response's CORS
                headers before relying on it.
              </li>
              <li>
                The data is public ecosystem data aggregated under MIT; the
                upstream model cards keep their own licenses — always check the
                asset itself before reuse.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
