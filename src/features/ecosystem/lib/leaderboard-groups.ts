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
  language: string | null;
  lowerIsBetter: boolean;
  languages: string[];
  rows: LeaderboardRow[];
  unrankedRows: LeaderboardRow[];
}

const LOWER_IS_BETTER =
  /(wer|cer|error rate|loss|latency|perplexity|distance|rmse|mae)/i;
const DIMENSION_ONLY = /^dim(?:ension)?[\s_:/-]*\d{2,5}$/i;

/**
 * Direction belongs to the metric, not the section. A section can mix
 * accuracy with error rates, which is exactly how OCR was mislabeled.
 */
export function isLowerBetterMetric(metric: string): boolean {
  return LOWER_IS_BETTER.test(metric);
}

/** Missing datasets, "reported" and bare embedding dimensions are not test
    sets. ASR rows without one are shown outside the ranking. */
export function normalizeTestSet(dataset: string | null): string | null {
  const value = (dataset ?? "").trim();
  if (!value || /^reported$/i.test(value) || DIMENSION_ONLY.test(value)) {
    return null;
  }
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

function dedupeRows(rows: LeaderboardRow[]): LeaderboardRow[] {
  const deduped = new Map<string, LeaderboardRow>();
  for (const row of rows) {
    const key = `${row.model}|${row.metric}|${row.dataset ?? ""}|${row.embeddingDim ?? ""}|${row.value}`;
    const previous = deduped.get(key);
    if (!previous || row.downloads > previous.downloads) {
      deduped.set(key, row);
    }
  }
  return [...deduped.values()];
}

/**
 * One table per task + metric + test set. ASR is split by language, and rows
 * with no stated test set are kept out of the ranking. Embedding dimension is
 * metadata, not a test set, so IR dim variants share a group.
 */
export function groupLeaderboardSections(
  sections: LeaderboardSection[]
): LeaderboardGroup[] {
  const groups = new Map<string, LeaderboardGroup>();
  const seenIds = new Map<string, number>();

  for (const section of sections) {
    for (const row of section.rows) {
      const testSet = normalizeTestSet(row.dataset);
      const isAsr = section.task === "ASR";
      const unrankedAsr = isAsr && !testSet;
      const language =
        isAsr && !unrankedAsr
          ? ([...row.languages].sort()[0] ?? "Unspecified")
          : null;
      const key = `${section.task}\u0000${row.metric}\u0000${testSet ?? ""}\u0000${unrankedAsr ? "unranked" : (language ?? "")}`;
      let group = groups.get(key);

      if (!group) {
        const baseId = slugify(
          `${section.task}-${row.metric}-${testSet ?? ""}-${unrankedAsr ? "unranked" : (language ?? "")}-${section.name}`
        );
        const seen = seenIds.get(baseId) ?? 0;
        seenIds.set(baseId, seen + 1);
        const labelParts = [section.name, row.metric];
        if (unrankedAsr) labelParts.push("test set not stated");
        else {
          if (language) labelParts.push(language);
          if (testSet) labelParts.push(testSet);
        }

        group = {
          id: seen === 0 ? baseId : `${baseId}-${seen + 1}`,
          task: section.task,
          sectionName: section.name,
          label: labelParts.join(" · "),
          metric: row.metric,
          testSet,
          language,
          lowerIsBetter: isLowerBetterMetric(row.metric),
          languages: [],
          rows: [],
          unrankedRows: [],
        };
        groups.set(key, group);
      }

      if (unrankedAsr) group.unrankedRows.push(row);
      else group.rows.push(row);
    }
  }

  return [...groups.values()]
    .map((group) => {
      group.rows = dedupeRows(group.rows);
      group.unrankedRows = dedupeRows(group.unrankedRows);
      sortRows(group.rows, group.lowerIsBetter);
      sortRows(group.unrankedRows, group.lowerIsBetter);
      group.languages = [
        ...new Set(
          [...group.rows, ...group.unrankedRows].flatMap((row) => row.languages)
        ),
      ].sort();
      return group;
    })
    .filter((group) =>
      group.task === "ASR"
        ? group.rows.length + group.unrankedRows.length > 0
        : group.rows.length > 1
    );
}
