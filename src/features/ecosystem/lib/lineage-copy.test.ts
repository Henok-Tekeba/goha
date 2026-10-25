import assert from "node:assert/strict";
import test from "node:test";

import lineageJson from "../../../../public/data/lineage.json";
import statsJson from "../../../../public/data/stats.json";
import type { EcosystemStats, LineagePayload } from "../types/ecosystem.types";
import { buildLineageCoverageCopy } from "./lineage-copy";

test("lineage copy uses the live model and total counts", () => {
  const lineage = lineageJson as unknown as LineagePayload;
  const stats = statsJson as unknown as EcosystemStats;
  const copy = buildLineageCoverageCopy(
    lineage.stats.models,
    stats.counts.models
  );

  assert.equal(
    copy,
    `${lineage.stats.models} of ${stats.counts.models} models declare a base_model on Hugging Face.`
  );
  assert.doesNotMatch(copy, /every/i);
  assert.ok(lineage.stats.models <= stats.counts.models);
});
