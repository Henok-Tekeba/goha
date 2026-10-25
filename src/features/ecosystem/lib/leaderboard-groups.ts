import type {
  LeaderboardRow,
  LeaderboardSection,
} from "../types/ecosystem.types";

export interface LeaderboardGroup {
  id: string;
  task: string;
  sectionName: string;
  label: string;
  metric: string;
  testSet: string | null;
  lowerIsBetter: boolean;
  languages: string[];
  rows: LeaderboardRow[];
}

const LOWER_IS_BETTER =
  /(wer|cer|error rate|loss|latency|perplexity|distance|rmse|mae)/i;

/**
 * Direction belongs to the metric, not the section. A section can mix
 * accuracy with error rates, which is exactly how OCR was mislabeled.
 */
export function isLowerBetterMetric(metric: string): boolean {
  return LOWER_IS_BETTER.test(metric);
}

function normalizeTestSet(dataset: string | null): string | null {
  const value = (dataset ?? "").trim();
  if (!value || /^reported$/i.test(value)) return null;
  return value;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "group"
  );
}

function sortRows(rows: LeaderboardRow[], lowerIsBetter: boolean): void {
  rows.sort((a, b) => {
    if (a.value == null && b.value == null) return 0;
    if (a.value == null) return 1;
    if (b.value == null) return -1;
    return lowerIsBetter ? a.value - b.value : b.value - a.value;
  });
}

/**
 * One table per task + metric + test set. Groups with fewer than two rows are
 * hidden: a one-row "ranking" is not a ranking.
 */
export function groupLeaderboardSections(
  sections: LeaderboardSection[]
): LeaderboardGroup[] {
  const groups = new Map<string, LeaderboardGroup>();
  const seenIds = new Map<string, number>();

  for (const section of sections) {
    for (const row of section.rows) {
      const testSet = normalizeTestSet(row.dataset);
      const key = `${section.task}\u0000${row.metric}\u0000${testSet ?? ""}`;
      let group = groups.get(key);

      if (!group) {
        const baseId = slugify(
          `${section.task}-${row.metric}-${testSet ?? ""}-${section.name}`
        );
        const seen = seenIds.get(baseId) ?? 0;
        seenIds.set(baseId, seen + 1);

        group = {
          id: seen === 0 ? baseId : `${baseId}-${seen + 1}`,
          task: section.task,
          sectionName: section.name,
          label: `${section.name} — ${row.metric}${
            testSet ? ` · ${testSet}` : ""
          }`,
          metric: row.metric,
          testSet,
          lowerIsBetter: isLowerBetterMetric(row.metric),
          languages: [],
          rows: [],
        };
        groups.set(key, group);
      }

      group.rows.push(row);
    }
  }

  return [...groups.values()]
    .map((group) => {
      sortRows(group.rows, group.lowerIsBetter);
      group.languages = [
        ...new Set(group.rows.flatMap((row) => row.languages)),
      ].sort();
      return group;
    })
    .filter((group) => group.rows.length > 1);
}
