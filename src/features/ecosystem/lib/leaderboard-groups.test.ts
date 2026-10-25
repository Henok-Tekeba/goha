import assert from "node:assert/strict";
import test from "node:test";

import leaderboardJson from "../../../../public/data/leaderboard.json";
import type {
  Leaderboard,
  LeaderboardRow,
  LeaderboardSection,
} from "../types/ecosystem.types";
import {
  groupLeaderboardSections,
  isLowerBetterMetric,
} from "./leaderboard-groups";

const leaderboard = leaderboardJson as unknown as Leaderboard;

test("metric direction is decided per metric", () => {
  assert.equal(isLowerBetterMetric("WER"), true);
  assert.equal(isLowerBetterMetric("Wer"), true);
  assert.equal(isLowerBetterMetric("Word Error Rate"), true);
  assert.equal(isLowerBetterMetric("Character Error Rate"), true);
  assert.equal(isLowerBetterMetric("Latency"), true);
  assert.equal(isLowerBetterMetric("Exact Match Accuracy"), false);
  assert.equal(isLowerBetterMetric("Cosine Accuracy@1"), false);
  assert.equal(isLowerBetterMetric("Mrr@10"), false);
  assert.equal(isLowerBetterMetric("Ndcg@10"), false);
});

test("real leaderboard groups by task, metric and test set", () => {
  const groups = groupLeaderboardSections(leaderboard.sections);

  assert.ok(groups.length > 0);

  for (const group of groups) {
    if (group.task !== "ASR") {
      assert.ok(
        group.rows.length > 1,
        `${group.label} should have been hidden (single entry)`
      );
    }

    if (group.rows.length > 0) {
      const datasets = new Set(group.rows.map((row) => row.dataset ?? ""));
      assert.equal(
        datasets.size,
        1,
        `${group.label} mixes test sets: ${[...datasets].join(", ")}`
      );
    }
    assert.ok(
      group.rows.every((row) => row.metric === group.metric),
      `${group.label} mixes metrics`
    );

    if (group.testSet) {
      assert.ok(
        group.rows.every((row) => row.dataset === group.testSet),
        `${group.label} has a test-set mismatch`
      );
    }

    for (let i = 1; i < group.rows.length; i += 1) {
      const previous = group.rows[i - 1].value;
      const current = group.rows[i].value;
      if (previous == null || current == null) continue;
      if (group.lowerIsBetter) {
        assert.ok(
          previous <= current,
          `${group.label} is not ascending (lower is better)`
        );
      } else {
        assert.ok(
          previous >= current,
          `${group.label} is not descending (higher is better)`
        );
      }
    }
  }

  const asrGroups = groups.filter((group) => group.task === "ASR");
  assert.ok(asrGroups.length >= 2);
  for (const group of asrGroups) {
    if (group.rows.length > 0) {
      assert.ok(group.language, `${group.label} has no language`);
      assert.ok(
        group.rows.every((row) =>
          row.languages.includes(group.language as string)
        ),
        `${group.label} mixes languages`
      );
    }
    assert.ok(
      ![...group.rows, ...group.unrankedRows].some((row) =>
        /t5|mt5|sec2sec/i.test(row.model)
      ),
      `${group.label} contains a non-ASR T5/sec2sec model`
    );
    assert.ok(
      group.unrankedRows.every((row) => row.dataset == null),
      `${group.label} ranks a row without a test set`
    );
    const keys = [...group.rows, ...group.unrankedRows].map(
      (row) =>
        `${row.model}|${row.metric}|${row.dataset ?? ""}|${row.embeddingDim ?? ""}|${row.value}`
    );
    assert.equal(
      new Set(keys).size,
      keys.length,
      `${group.label} contains duplicate results`
    );
  }

  const ocrGroups = groups.filter(
    (group) => group.sectionName === "Tigrinya OCR"
  );
  assert.ok(ocrGroups.length >= 3);
  const ocrAccuracy = ocrGroups.find(
    (group) => group.metric === "Exact Match Accuracy"
  );
  assert.equal(ocrAccuracy?.lowerIsBetter, false);
  assert.ok(
    ocrGroups
      .filter((group) => /error rate/i.test(group.metric))
      .every((group) => group.lowerIsBetter)
  );

  const retrievalGroups = groups.filter((group) => group.task === "Retrieval");
  assert.ok(retrievalGroups.length >= 1);
  assert.ok(retrievalGroups.every((group) => !group.lowerIsBetter));
  assert.ok(
    retrievalGroups.every(
      (group) => !/^dim[\s_:/-]*\d+$/i.test(group.testSet ?? "")
    ),
    "embedding dimensions must not be used as test sets"
  );
  assert.ok(
    retrievalGroups.some((group) =>
      group.rows.some((row) => row.embeddingDim != null)
    ),
    "IR dim variants should expose an embedding dimension"
  );

  assert.ok(
    !groups.some((group) => /Dot |Mrr|Ndcg/i.test(group.metric)),
    "single-entry sparse/reranking groups should be hidden"
  );
});

test("a mixed section is split and then single-entry groups are hidden", () => {
  const row = (
    model: string,
    metric: string,
    value: number,
    dataset: string | null = "test"
  ): LeaderboardRow => ({
    model,
    org: "org",
    projectId: null,
    languages: ["Amharic"],
    dataset,
    embeddingDim: null,
    evaluationSource: null,
    evaluationSourceKind: "model-card",
    metric,
    metricType: "",
    value,
    display: `${value}%`,
    verified: false,
    downloads: 0,
    likes: 0,
    source: null,
  });

  const section: LeaderboardSection = {
    id: "mixed",
    task: "Other",
    name: "Mixed section",
    lowerIsBetter: false,
    languages: ["Amharic"],
    rows: [
      row("slow", "WER", 20),
      row("fast", "WER", 10),
      row("accurate", "Exact Match Accuracy", 90),
    ],
  };

  const groups = groupLeaderboardSections([section]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].metric, "WER");
  assert.equal(groups[0].lowerIsBetter, true);
  assert.deepEqual(
    groups[0].rows.map((entry) => entry.model),
    ["fast", "slow"]
  );
});
