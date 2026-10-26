import assert from "node:assert/strict";
import { test } from "node:test";

import { csvEscape } from "./csv";

test("quoting still protects commas, quotes and newlines", () => {
  assert.equal(csvEscape("plain"), "plain");
  assert.equal(csvEscape("a,b"), '"a,b"');
  assert.equal(csvEscape('a"b'), '"a""b"');
  assert.equal(csvEscape("a\nb"), '"a\nb"');
  assert.equal(csvEscape(null), "");
  assert.equal(csvEscape(42), "42");
});

test("spreadsheet formulas are forced to text", () => {
  assert.equal(
    csvEscape('=HYPERLINK("https://example.com")'),
    `"'=HYPERLINK(""https://example.com"")"`
  );
  assert.equal(csvEscape("+1+1"), "'+1+1");
  assert.equal(csvEscape("-1+1"), "'-1+1");
  assert.equal(csvEscape("@SUM(A1:A2)"), "'@SUM(A1:A2)");
  assert.equal(csvEscape("\t=1+1"), "'\t=1+1");
  assert.equal(csvEscape("\r=1+1"), '"\'\r=1+1"');
});

test("negative numbers from trusted numeric fields stay numeric", () => {
  assert.equal(csvEscape(-3), "-3");
});
