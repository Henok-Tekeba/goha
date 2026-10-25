import assert from "node:assert/strict";
import test from "node:test";

import { formatCount } from "./format-count";

test("formatCount pluralizes zero, one and many", () => {
  assert.equal(formatCount(0, "model"), "0 models");
  assert.equal(formatCount(1, "model"), "1 model");
  assert.equal(formatCount(2, "model"), "2 models");
  assert.equal(formatCount(1, "dataset"), "1 dataset");
  assert.equal(formatCount(1, "repository", "repositories"), "1 repository");
  assert.equal(formatCount(2, "repository", "repositories"), "2 repositories");
  assert.equal(formatCount(1000, "publisher"), "1,000 publishers");
});
