/**
 * Ask Goha parser evaluation.
 *
 * A fixed set of realistic queries with the intent we expect the parser to
 * extract. Run with `pnpm test:ask`. The reported number is the fraction of
 * expected fields the parser got right — the figure quoted in the README.
 */
import { parseAskQuery } from "./ask-parser";

interface Case {
  q: string;
  languages?: string[];
  tasks?: string[];
  entities?: string[];
  intent?: string;
  sort?: string;
  maxParams?: number;
}

const CASES: Case[] = [
  {
    q: "Tigrinya speech models",
    languages: ["Tigrinya"],
    tasks: ["ASR"],
    entities: ["model"],
  },
  { q: "Amharic ASR", languages: ["Amharic"], tasks: ["ASR"] },
  {
    q: "speech to text for Afaan Oromo",
    languages: ["Afaan Oromo"],
    tasks: ["ASR"],
  },
  {
    q: "Oromo TTS models",
    languages: ["Afaan Oromo"],
    tasks: ["TTS"],
    entities: ["model"],
  },
  {
    q: "Amharic translation models",
    languages: ["Amharic"],
    tasks: ["Translation"],
  },
  { q: "Ge'ez datasets", languages: ["Ge'ez"], entities: ["dataset"] },
  { q: "Somali NER", languages: ["Somali"], tasks: ["NER"] },
  { q: "Amharic LLMs", languages: ["Amharic"], tasks: ["LLM"] },
  {
    q: "Amharic LLMs under 2B",
    languages: ["Amharic"],
    tasks: ["LLM"],
    maxParams: 2e9,
  },
  {
    q: "models under 500M for Amharic",
    languages: ["Amharic"],
    maxParams: 5e8,
  },
  { q: "Amharic embeddings", languages: ["Amharic"], tasks: ["Embeddings"] },
  {
    q: "who builds Amharic embeddings?",
    languages: ["Amharic"],
    tasks: ["Embeddings"],
    entities: ["org"],
  },
  {
    q: "companies building Tigrinya AI",
    languages: ["Tigrinya"],
    entities: ["org"],
  },
  { q: "papers about code-switching", entities: ["paper"] },
  {
    q: "research on Amharic tokenizers",
    languages: ["Amharic"],
    entities: ["paper"],
  },
  { q: "latest Amharic models", languages: ["Amharic"], sort: "newest" },
  {
    q: "most downloaded Amharic models",
    languages: ["Amharic"],
    sort: "downloads",
  },
  {
    q: "best Tigrinya speech model",
    languages: ["Tigrinya"],
    tasks: ["ASR"],
    sort: "best",
  },
  {
    q: "what's missing for Afaan Oromo?",
    languages: ["Afaan Oromo"],
    intent: "gaps",
  },
  {
    q: "what are the gaps for Amharic?",
    languages: ["Amharic"],
    intent: "gaps",
  },
  { q: "what's missing in Tigrinya?", languages: ["Tigrinya"], intent: "gaps" },
  { q: "አማርኛ speech models", languages: ["Amharic"], tasks: ["ASR"] },
  { q: "ትግርኛ datasets", languages: ["Tigrinya"], entities: ["dataset"] },
  { q: "MIT licensed Amharic models", languages: ["Amharic"] },
  {
    q: "benchmarks for Amharic ASR",
    languages: ["Amharic"],
    tasks: ["ASR", "Benchmark"],
    entities: ["benchmark"],
  },
  {
    q: "Amharic sentiment models",
    languages: ["Amharic"],
    tasks: ["Classification"],
  },
  { q: "OCR for Tigrinya", languages: ["Tigrinya"], tasks: ["OCR"] },
  {
    q: "Amharic speech recognition datasets",
    languages: ["Amharic"],
    tasks: ["ASR"],
    entities: ["dataset"],
  },
  { q: "voice generation for Amharic", languages: ["Amharic"], tasks: ["TTS"] },
  {
    q: "semantic search models for Amharic",
    languages: ["Amharic"],
    tasks: ["Embeddings"],
  },
  {
    q: "named entity recognition Amharic",
    languages: ["Amharic"],
    tasks: ["NER"],
  },
  { q: "Amharic chat models", languages: ["Amharic"], tasks: ["LLM"] },
  { q: "Whisper models for Tigrinya", languages: ["Tigrinya"] },
  { q: "Llama fine-tunes for Amharic", languages: ["Amharic"] },
  {
    q: "datasets for Oromo speech",
    languages: ["Afaan Oromo"],
    tasks: ["ASR"],
    entities: ["dataset"],
  },
  { q: "Wolaytta models", languages: ["Wolayttattoo"] },
  { q: "Sidaama speech", languages: ["Sidaamu Afoo"], tasks: ["ASR"] },
  { q: "Amharic benchmarks", languages: ["Amharic"], entities: ["benchmark"] },
  { q: "compare Amharic models", languages: ["Amharic"], entities: ["model"] },
  {
    q: "translation datasets for Tigrinya",
    languages: ["Tigrinya"],
    tasks: ["Translation"],
    entities: ["dataset"],
  },
  { q: "Amharic research papers", languages: ["Amharic"], entities: ["paper"] },
  {
    q: "who is behind Amharic LLMs",
    languages: ["Amharic"],
    tasks: ["LLM"],
    entities: ["org"],
  },
  {
    q: "most used Tigrinya models",
    languages: ["Tigrinya"],
    sort: "downloads",
  },
  { q: "text to speech Amharic", languages: ["Amharic"], tasks: ["TTS"] },
  { q: "Amharic image generation", languages: ["Amharic"] },
  {
    q: "Afaan Oromo translation",
    languages: ["Afaan Oromo"],
    tasks: ["Translation"],
  },
  { q: "what exists for Ge'ez?", languages: ["Ge'ez"] },
  {
    q: "Amharic model leaderboard",
    languages: ["Amharic"],
    entities: ["benchmark"],
  },
];

function same(a: string[], b: string[]): boolean {
  return b.every((value) => a.includes(value));
}

let passed = 0;
let total = 0;
const failures: string[] = [];

for (const testCase of CASES) {
  const parsed = parseAskQuery(testCase.q);
  const checks: [string, boolean][] = [];
  if (testCase.languages)
    checks.push(["languages", same(parsed.languages, testCase.languages)]);
  if (testCase.tasks)
    checks.push(["tasks", same(parsed.tasks, testCase.tasks)]);
  if (testCase.entities)
    checks.push(["entities", same(parsed.entities, testCase.entities)]);
  if (testCase.intent)
    checks.push(["intent", parsed.intent === testCase.intent]);
  if (testCase.sort) checks.push(["sort", parsed.sort === testCase.sort]);
  if (testCase.maxParams)
    checks.push([
      "maxParams",
      parsed.maxParams !== null &&
        Math.abs(parsed.maxParams - testCase.maxParams) < 1,
    ]);

  for (const [field, ok] of checks) {
    total += 1;
    if (ok) passed += 1;
    else
      failures.push(
        `✗ ${testCase.q}\n   ${field}: got ${JSON.stringify(parsed[field as keyof typeof parsed])}`
      );
  }
}

const accuracy = total === 0 ? 0 : passed / total;
console.log(`Ask Goha parser evaluation — ${CASES.length} queries`);
console.log(
  `Field accuracy: ${passed}/${total} (${(accuracy * 100).toFixed(1)}%)`
);
if (failures.length) {
  console.log("\nFailures:");
  for (const failure of failures) console.log(failure);
}
process.exit(accuracy >= 0.9 ? 0 : 1);
