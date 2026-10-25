import assert from "node:assert/strict";
import test from "node:test";

import {
  isAsrModel,
  modelTaskType,
} from "../../../../scripts/model-classification.mjs";

test("pipeline_tag wins over everything else", () => {
  assert.equal(
    modelTaskType({
      pipeline_tag: "automatic-speech-recognition",
      type_label: "Image Generation",
    }),
    "automatic-speech-recognition"
  );
  assert.equal(
    isAsrModel({
      pipeline_tag: "automatic-speech-recognition",
      type_label: "Image Generation",
    }),
    true
  );
});

test("model-index task.type is used when pipeline_tag is missing", () => {
  const model = {
    pipeline_tag: null,
    type_label: "Image Generation",
    eval_results: [{ task: { type: "automatic-speech-recognition" } }],
  };
  assert.equal(modelTaskType(model), "automatic-speech-recognition");
  assert.equal(isAsrModel(model), true);
});

test("type_label is the last fallback", () => {
  assert.equal(isAsrModel({ pipeline_tag: null, type_label: "ASR" }), true);
  assert.equal(
    isAsrModel({ pipeline_tag: null, type_label: "Image Generation" }),
    false
  );
  assert.equal(
    isAsrModel({
      pipeline_tag: null,
      type_label: "LLM",
      eval_results: [],
    }),
    false
  );
});
