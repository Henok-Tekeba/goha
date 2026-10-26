import assert from "node:assert/strict";
import { test } from "node:test";

import { MAX_BOOKMARKS, parseBookmarkIds, toggleBookmarkId } from "./bookmarks";

test("parses only valid unique bookmark ids", () => {
  assert.deepEqual(parseBookmarkIds(null), []);
  assert.deepEqual(parseBookmarkIds("not json"), []);
  assert.deepEqual(parseBookmarkIds('{"a":1}'), []);
  assert.deepEqual(parseBookmarkIds('["pjt_1","pjt_1","",42,"pjt_2"]'), [
    "pjt_1",
    "pjt_2",
  ]);
});

test("caps a runaway local watchlist", () => {
  const raw = JSON.stringify(
    Array.from({ length: MAX_BOOKMARKS + 20 }, (_, index) => `pjt_${index}`)
  );
  assert.equal(parseBookmarkIds(raw).length, MAX_BOOKMARKS);
});

test("toggles a bookmark without mutating the input", () => {
  const initial = ["pjt_1"];
  const added = toggleBookmarkId(initial, "pjt_2");
  assert.deepEqual(added, ["pjt_1", "pjt_2"]);
  assert.deepEqual(initial, ["pjt_1"]);
  assert.deepEqual(toggleBookmarkId(added, "pjt_1"), ["pjt_2"]);
  assert.deepEqual(toggleBookmarkId([], ""), []);
});
