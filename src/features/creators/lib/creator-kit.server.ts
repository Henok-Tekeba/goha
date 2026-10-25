import { FRONTEND_URL } from "@/config/config";
import {
  getPublicInsights,
  getPublicLeaderboard,
  getPublicPapers,
  getPublicStats,
} from "@/features/ecosystem/lib/public-data.server";
import { getGapReport, getLanguagePage } from "@/shared/lib/local-data.server";

export interface CreatorPost {
  id: string;
  label: string;
  text: string;
  path: string;
}

export interface CreatorLink {
  id: string;
  label: string;
  href: string;
}

export interface CreatorKit {
  oneLiner: string;
  posts: CreatorPost[];
  links: CreatorLink[];
}

function joinLines(lines: (string | null | undefined)[]): string {
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}

function formatGrowth(growth: number): string {
  return `+${growth}%`;
}

export function getCreatorKit(): CreatorKit {
  const base = FRONTEND_URL.replace(/\/$/, "");
  const stats = getPublicStats();
  const insights = getPublicInsights();
  const papers = getPublicPapers();
  const leaderboard = getPublicLeaderboard();
  const report = getGapReport();

  const topMover = insights.topGainers[0];
  const latestPaper = papers[0];
  const topLanguage = report.languages[0];
  const languagePage = topLanguage
    ? getLanguagePage(topLanguage.slug)
    : undefined;
  const benchmarkSection = leaderboard.sections.find(
    (section) => section.rows.length >= 3
  );
  const topBenchmarks = benchmarkSection?.rows.slice(0, 3) ?? [];
  const unevaluated = report.evaluation.total - report.evaluation.evaluated;

  const oneLiner = `goha is the home of Ethiopian AI — ${stats.counts.models} models, ${stats.counts.datasets} datasets and ${stats.counts.papers} papers across ${stats.counts.languages} languages, in one open index.`;

  const weeklyPost = joinLines([
    "🌍 This week in Ethiopian AI",
    "",
    `The goha index now tracks ${stats.counts.models} models, ${stats.counts.datasets} datasets and ${stats.counts.papers} papers across ${stats.counts.languages} languages.`,
    topMover
      ? `📈 Biggest mover: ${topMover.name} (${formatGrowth(topMover.growth)} downloads this week)`
      : null,
    latestPaper ? `📄 Latest research: ${latestPaper.title}` : null,
    "",
    "Explore the ecosystem, compare models and find the gaps:",
    base,
    "",
    "#EthiopianAI #Amharic #NLP #OpenSource",
  ]);

  const gapPost = joinLines([
    "🧩 What Ethiopian AI is still missing",
    "",
    `${report.emptyCells.length} of ${report.totalCells} language × task combinations have no model, dataset or paper.`,
    `${unevaluated} of ${report.evaluation.total} models publish no evaluation result.`,
    `${report.licensing.total} models and datasets don't declare a license.`,
    "",
    "The full, source-linked gap report:",
    `${base}/gaps`,
    "",
    "#EthiopianAI #NLP",
  ]);

  const languagePost = languagePage
    ? joinLines([
        `🗣️ ${languagePage.name}, by the numbers`,
        "",
        `${languagePage.models.length} models · ${languagePage.datasets.length} datasets · ${languagePage.papers.length} papers`,
        languagePage.gaps[0] ? `Gap: ${languagePage.gaps[0]}` : null,
        "",
        "See the coverage map and every linked asset:",
        `${base}/lang/${languagePage.slug}`,
        "",
        "#EthiopianAI #NLP",
      ])
    : null;

  const benchmarkPost =
    benchmarkSection && topBenchmarks.length > 0
      ? joinLines([
          `📊 ${benchmarkSection.name}`,
          "",
          ...topBenchmarks.map(
            (row, index) =>
              `${index + 1}. ${row.model} — ${row.display} ${row.metric}`
          ),
          "",
          "Every result is linked to its source. Compare models side by side:",
          `${base}/leaderboard`,
          "",
          "#EthiopianAI #NLProc",
        ])
      : null;

  const posts: CreatorPost[] = [
    {
      id: "weekly",
      label: "Weekly pulse",
      text: weeklyPost,
      path: "/",
    },
    {
      id: "gaps",
      label: "Gap report",
      text: gapPost,
      path: "/gaps",
    },
    ...(languagePost && languagePage
      ? [
          {
            id: "language",
            label: `${languagePage.name} spotlight`,
            text: languagePost,
            path: `/lang/${languagePage.slug}`,
          },
        ]
      : []),
    ...(benchmarkPost
      ? [
          {
            id: "benchmarks",
            label: "Benchmark board",
            text: benchmarkPost,
            path: "/leaderboard",
          },
        ]
      : []),
  ];

  const links: CreatorLink[] = [
    { id: "gaps", label: "Gap report", href: "/gaps" },
    { id: "leaderboard", label: "Benchmarks", href: "/leaderboard" },
    { id: "languages", label: "Languages", href: "/lang" },
    { id: "lineage", label: "Model lineage", href: "/lineage" },
    { id: "activity", label: "Activity", href: "/activity" },
  ];

  return { oneLiner, posts, links };
}
