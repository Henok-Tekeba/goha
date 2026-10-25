import assert from "node:assert/strict";
import test from "node:test";

import { buildActivityPulseRows } from "./activity-pulse";

const NOW = new Date("2026-10-25T12:00:00.000Z");

test("activity pulse keeps exactly 30 ascending buckets", () => {
  const rows = buildActivityPulseRows([], NOW);

  assert.equal(rows.length, 30);
  assert.equal(rows[0].day, "2026-09-26");
  assert.equal(rows.at(-1)?.day, "2026-10-25");
  assert.equal(rows.at(-1)?.label, "Oct 25");
  assert.deepEqual(
    rows.map((row) => row.day),
    [...rows.map((row) => row.day)].sort()
  );
});

test("events outside the window do not create an out-of-order bucket", () => {
  const rows = buildActivityPulseRows(
    [
      { at: "2026-09-25T23:00:00.000Z" }, // before the 30-day window
      { at: "2026-09-26T01:00:00.000Z" }, // first day
      { at: "2026-10-25T01:00:00.000Z" }, // last day
    ],
    NOW
  );

  assert.equal(rows.length, 30);
  assert.equal(rows[0].day, "2026-09-26");
  assert.equal(rows[0].events, 1);
  assert.equal(rows.at(-1)?.day, "2026-10-25");
  assert.equal(rows.at(-1)?.events, 1);
  assert.equal(
    rows.reduce((sum, row) => sum + row.events, 0),
    2,
    "the Sep 25 event must be excluded"
  );
  assert.equal(
    rows.filter((row) => row.label === "Sep 25").length,
    0,
    "no Sep 25 label should be appended after Oct 25"
  );
});

test("multiple events on the same UTC day are counted once in that bucket", () => {
  const rows = buildActivityPulseRows(
    [
      { at: "2026-10-01T01:00:00.000Z" },
      { at: "2026-10-01T22:00:00.000Z" },
      { at: "2026-10-02T01:00:00.000Z" },
    ],
    NOW
  );

  const oct1 = rows.find((row) => row.day === "2026-10-01");
  const oct2 = rows.find((row) => row.day === "2026-10-02");
  assert.equal(oct1?.events, 2);
  assert.equal(oct2?.events, 1);
});
