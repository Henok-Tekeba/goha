import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { enrichModelDetails } from "./index.mjs";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch({ modelInfo, readme = "" }) {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/api/models/")) {
      return new Response(modelInfo, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(readme, {
      status: 200,
      headers: { "content-type": "text/plain" },
    });
  };
}

test("enrichModelDetails copies HF ids from the model API response", async () => {
  mockFetch({
    modelInfo: JSON.stringify({
      _id: "internal-123",
      sha: "abc123def456",
      cardData: { license: "apache-2.0" },
      siblings: [{ rfilename: "config.json" }],
    }),
  });

  const enriched = await enrichModelDetails({
    id: "owner/model",
    hf_internal_id: null,
    hf_sha: null,
  });

  assert.equal(enriched.hf_internal_id, "internal-123");
  assert.equal(enriched.hf_sha, "abc123def456");
  assert.equal(enriched.license, "apache-2.0");
  assert.equal(enriched.file_count, 1);
});

/* Regression: `info` used to be block-scoped inside the try. Optional chaining
   on an undeclared binding throws ReferenceError, so every scrape died on the
   first model whose API response could not be parsed. */
test("enrichModelDetails falls back when the model API response is unusable", async () => {
  mockFetch({ modelInfo: "not-json" });

  const enriched = await enrichModelDetails({
    id: "owner/model",
    hf_internal_id: "listing-id",
    hf_sha: "listing-sha",
  });

  assert.equal(enriched.hf_internal_id, "listing-id");
  assert.equal(enriched.hf_sha, "listing-sha");
  assert.equal(enriched.license, null);
});
