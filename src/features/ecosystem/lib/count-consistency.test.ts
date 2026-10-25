import assert from "node:assert/strict";
import test from "node:test";
import rawOrgs from "@data/orgs.mock.json";
import rawPapers from "@data/papers.mock.json";
import {
  getGapReport,
  getLanguageCoverageSummary,
  getLanguagePage,
  type LanguagePageData,
  languages,
  projects,
} from "@/shared/lib/local-data.server";
import coverageJson from "../../../../public/data/language-coverage.json";
import statsJson from "../../../../public/data/stats.json";
import type {
  EcosystemStats,
  LanguageCoveragePayload,
} from "../types/ecosystem.types";
import { getHomepageDashboardData } from "./homepage-data.server";

const coverage = coverageJson as unknown as LanguageCoveragePayload;
const stats = statsJson as unknown as EcosystemStats;

const models = projects.filter((project) =>
  project.projectCategories?.some((category) => category.name === "Model")
);
const datasets = projects.filter((project) =>
  project.projectCategories?.some((category) => category.name === "Dataset")
);

test("homepage language tiles use the same counts as language pages", async () => {
  const dashboard = await getHomepageDashboardData();

  assert.equal(dashboard.languages.length, languages.length);
  for (const tile of dashboard.languages) {
    const page = getLanguagePage(tile.slug);
    assert.ok(page, `missing language page for ${tile.name}`);
    assert.equal(
      tile.total,
      page.models.length + page.datasets.length,
      `${tile.name} tile does not match its language page`
    );
  }
});

test("radar cells reconcile with language-page coverage", () => {
  assert.deepEqual(
    coverage.languages,
    languages.map((language) => language.name)
  );

  for (const row of coverage.rows) {
    for (const language of languages) {
      const page = getLanguagePage(language.slug);
      assert.ok(page);
      const cell = page.coverage.find((entry) => entry.task === row.task);
      assert.ok(cell, `${language.name} is missing ${String(row.task)}`);
      assert.equal(
        row[language.name],
        cell.models + cell.datasets,
        `${language.name} × ${String(row.task)} radar count is stale`
      );
    }
  }
});

test("gap report uses the same canonical language set", () => {
  const report = getGapReport();

  assert.equal(report.totalCells, languages.length * report.tasks.length);
  assert.deepEqual(
    new Set(report.languages.map((language) => language.name)),
    new Set(languages.map((language) => language.name))
  );
  assert.ok(
    report.languages.some((language) => language.name === "Ge'ez"),
    "Ge'ez must be in the gap report"
  );

  for (const language of report.languages) {
    const page = getLanguagePage(language.slug);
    assert.ok(page);
    for (const cell of language.cells) {
      const coverageCell: LanguagePageData["coverage"][number] | undefined =
        page.coverage.find((entry) => entry.task === cell.task);
      assert.ok(coverageCell);
      assert.equal(
        cell.assets,
        coverageCell.models + coverageCell.datasets,
        `${language.name} × ${cell.task} gap count is stale`
      );
    }
  }
});

test("headline stats match the committed fixtures", () => {
  assert.equal(stats.counts.models, models.length);
  assert.equal(stats.counts.datasets, datasets.length);
  assert.equal(stats.counts.languages, languages.length);
  assert.equal(stats.counts.papers, rawPapers.length);
  assert.equal(stats.counts.orgs, rawOrgs.length);
});

test("licensing and untagged buckets have explicit denominators", () => {
  const report = getGapReport();
  const summary = getLanguageCoverageSummary();

  assert.equal(report.licensing.assets, models.length + datasets.length);
  assert.ok(report.licensing.total <= report.licensing.assets);
  assert.equal(summary.assets, models.length + datasets.length);
  assert.equal(summary.taggedAssets + summary.untaggedAssets, summary.assets);
  assert.equal(summary.taggedPapers + summary.untaggedPapers, summary.papers);
  assert.equal(report.untagged.assets, summary.untaggedAssets);
  assert.equal(report.untagged.papers, summary.untaggedPapers);
});
