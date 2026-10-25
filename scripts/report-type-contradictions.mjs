#!/usr/bin/env node
/**
 * Report models whose scraped type_label contradicts a high-confidence family
 * inferred from the base model. This script only writes a CSV; it never edits
 * indexed data.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODELS = JSON.parse(
  readFileSync(path.join(ROOT, "data", "models.json"), "utf8")
).data;

const FAMILIES = [
  {
    family: "ASR",
    match: /whisper|wav2vec|w2v|hubert|wavlm|data2vec|speech/i,
    allowed: /asr|speech/i,
  },
  {
    family: "Translation",
    match: /nllb|m2m[_-]?100|seamless|(^|[/_-])t5|mt5|translat/i,
    allowed: /translation|llm/i,
  },
  {
    family: "LLM",
    match:
      /llama|qwen|gemma|mistral|mixtral|gpt|bloom|falcon|phi|deepseek|olmo|stablelm/i,
    allowed:
      /llm|nlp|asr|translation|tts|ner|embedding|classification|vision|ocr|image.to.text/i,
  },
  {
    family: "OCR",
    match: /trocr|ocr/i,
    allowed: /ocr|image.to.text|vision/i,
  },
];

const rows = [];
for (const model of MODELS) {
  /* Only high-confidence base-model families. Models without a declared base
     model are left for human review, not guessed from their names. */
  const evidence = String(model.base_model ?? "");
  const rule = FAMILIES.find((entry) => entry.match.test(evidence));
  if (!rule) continue;
  const typeLabel = String(model.type_label ?? "");
  if (rule.allowed.test(typeLabel)) continue;
  rows.push({
    id: model.id,
    name: model.name,
    type_label: typeLabel,
    base_model: model.base_model ?? "",
    expected_family: rule.family,
  });
}

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const header = ["id", "name", "type_label", "base_model", "expected_family"];
const csv = [
  header.join(","),
  ...rows.map((row) => header.map((key) => csvEscape(row[key])).join(",")),
].join("\n");

const outDir = path.join(ROOT, "reports");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "type-label-contradictions.csv");
writeFileSync(outPath, `${csv}\n`);

console.log(
  `${rows.length} type-label contradiction(s) written to ${path.relative(ROOT, outPath)}`
);
process.exit(0);
