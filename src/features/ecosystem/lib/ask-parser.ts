/**
 * Ask Goha — deterministic natural-language search over the index.
 *
 * No LLM, no embeddings, no API calls. The vocabulary of the domain is
 * closed (7 languages, ~10 tasks, 5 entity types), so a rule-based parser
 * is both accurate and fully inspectable. Every failure is a missing
 * synonym, never a hallucination.
 */

export type AskEntity = "model" | "dataset" | "paper" | "org" | "benchmark";

export type AskIntent = "lookup" | "gaps" | "unknown";

export interface ParsedAskQuery {
  raw: string;
  normalized: string;
  languages: string[];
  tasks: string[];
  entities: AskEntity[];
  intent: AskIntent;
  sort: "downloads" | "newest" | "best" | null;
  maxParams: number | null;
  license: string | null;
  keywords: string[];
}

/* ------------------------------- dictionaries ------------------------------ */

const LANGUAGE_ALIASES: [string, RegExp[]][] = [
  ["Amharic", [/\bamharic\b/, /አማርኛ/, /\bamhara\b/]],
  ["Afaan Oromo", [/\boromo\b/, /\bafaan\b/, /\boromiffa\b/]],
  ["Tigrinya", [/\btigrinya\b/, /\btigrigna\b/, /\btigray\b/, /ትግርኛ/]],
  ["Ge'ez", [/\bge'?ez\b/, /ግዕዝ/]],
  ["Somali", [/\bsomali\b/]],
  ["Sidaamu Afoo", [/\bsidaam/]],
  ["Wolayttattoo", [/\bwolayt/]],
  ["Afaraf", [/\bafar\b/]],
  ["English", [/\benglish\b/]],
];

const TASK_ALIASES: [string, RegExp[]][] = [
  [
    "ASR",
    [
      /\basr\b/,
      /\bstt\b/,
      /speech[- ]to[- ]text/,
      /speech recognition/,
      /transcri/,
      /voice recognition/,
      /\bspeech\b/,
    ],
  ],
  [
    "TTS",
    [/\btts\b/, /text[- ]to[- ]speech/, /speech synthesis/, /voice generat/],
  ],
  ["Translation", [/\btranslat/, /\bmt\b/, /\bnmt\b/]],
  ["LLM", [/\bllms?\b/, /language model/, /\bchat\b/, /\binstruct\b/]],
  ["Embeddings", [/embedding/, /retrieval/, /semantic search/, /\bvector/]],
  ["NER", [/\bner\b/, /named entit/]],
  ["Classification", [/classif/, /sentiment/]],
  ["OCR", [/\bocr\b/, /handwrit/, /optical character/]],
  ["Benchmark", [/benchmark/, /leaderboard/, /\bwer\b/, /\bscore/]],
];

const ENTITY_ALIASES: [AskEntity, RegExp[]][] = [
  [
    "paper",
    [/\bpapers?\b/, /research/, /\bstud(y|ies)\b/, /arxiv/, /publication/],
  ],
  ["dataset", [/\bdatasets?\b/, /\bcorpus\b/, /corpora/]],
  ["model", [/\bmodels?\b/]],
  [
    "org",
    [
      /\borgs?\b/,
      /\borgani[sz]ation/,
      /compan(y|ies)/,
      /\blabs?\b/,
      /\bwho (builds|made|is behind)/,
    ],
  ],
  ["benchmark", [/benchmark/, /leaderboard/, /\brank/]],
];

const SORT_DOWNLOADS = /most (downloaded|used|popular)|popular|top|widely used/;
const SORT_NEWEST = /newest|latest|recent/;
const SORT_BEST = /\bbest\b|lowest (wer|error)|highest (accuracy|score)/;
const GAP_INTENT =
  /missing|gap|lack|absent|what.*(need|missing)|opportunit|not exist|no .*yet/;

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "for",
  "of",
  "in",
  "on",
  "to",
  "and",
  "or",
  "me",
  "show",
  "find",
  "list",
  "give",
  "what",
  "which",
  "who",
  "how",
  "many",
  "are",
  "there",
  "any",
  "some",
  "with",
  "about",
  "that",
  "this",
  "i",
  "we",
  "can",
  "you",
  "please",
  "do",
  "does",
  "have",
  "has",
  "exists",
  "exist",
  "under",
  "less",
  "than",
  "over",
  "more",
  "using",
  "use",
  "built",
  "build",
  "built",
  "available",
  "index",
  "goha",
  "ethiopian",
  "ethiopia",
]);

/* sort / gap / constraint words carry no search meaning once parsed */
const NOISE_WORDS = new Set([
  "downloaded",
  "download",
  "downloads",
  "popular",
  "top",
  "best",
  "newest",
  "latest",
  "recent",
  "missing",
  "gap",
  "gaps",
  "lack",
  "lacks",
  "absent",
  "opportunity",
  "opportunities",
  "licensed",
  "license",
  "compare",
  "versus",
  "vs",
  "rank",
  "ranked",
  "ranking",
  "scores",
  "score",
  "wer",
  "everything",
  "anything",
  "something",
  "model",
  "models",
  "dataset",
  "datasets",
  "paper",
  "papers",
  "research",
  "benchmark",
  "benchmarks",
  "leaderboard",
  "speech",
  "translation",
  "embedding",
  "embeddings",
  "classification",
  "sentiment",
  "ocr",
  "handwriting",
  "chat",
  "instruct",
  "language",
  "named",
  "entity",
  "ምን",
  "አለ",
  "ስንት",
  "አማርኛ",
  "ትግርኛ",
  "ግዕዝ",
]);

/* --------------------------------- parser ---------------------------------- */

export function parseAskQuery(raw: string): ParsedAskQuery {
  const normalized = raw.toLowerCase().trim();
  const languages: string[] = [];
  const tasks: string[] = [];
  const entities: AskEntity[] = [];

  for (const [language, patterns] of LANGUAGE_ALIASES) {
    if (patterns.some((re) => re.test(normalized))) languages.push(language);
  }
  for (const [task, patterns] of TASK_ALIASES) {
    if (patterns.some((re) => re.test(normalized))) tasks.push(task);
  }
  for (const [entity, patterns] of ENTITY_ALIASES) {
    if (patterns.some((re) => re.test(normalized))) entities.push(entity);
  }

  const intent: AskIntent = GAP_INTENT.test(normalized) ? "gaps" : "lookup";

  const sort = SORT_BEST.test(normalized)
    ? "best"
    : SORT_DOWNLOADS.test(normalized)
      ? "downloads"
      : SORT_NEWEST.test(normalized)
        ? "newest"
        : null;

  /* "under 2b" / "less than 500m" → parameter ceiling */
  let maxParams: number | null = null;
  const sizeMatch = normalized.match(
    /(?:under|less than|below|<)\s*(\d+(?:\.\d+)?)\s*(b|billion|m|million|k)\b/
  );
  if (sizeMatch) {
    const value = Number.parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2];
    const multiplier =
      unit === "b" || unit === "billion"
        ? 1e9
        : unit === "m" || unit === "million"
          ? 1e6
          : 1e3;
    maxParams = value * multiplier;
  }

  const licenseMatch = normalized.match(
    /\b(mit|apache(?:-2\.0)?|llama[-\d.]*|gemma|cc-by[-\w]*)\b/
  );
  const license = licenseMatch ? licenseMatch[1] : null;

  /* leftover meaningful words become keyword search terms */
  const keywords = normalized
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
    .filter((word) => !NOISE_WORDS.has(word))
    .filter((word) => !isDictionaryWord(word));

  return {
    raw,
    normalized,
    languages,
    tasks,
    entities,
    intent,
    sort,
    maxParams,
    license,
    keywords,
  };
}

const DICTIONARY_WORDS = new Set(
  [
    ...LANGUAGE_ALIASES.flatMap(([, patterns]) => patterns),
    ...TASK_ALIASES.flatMap(([, patterns]) => patterns),
    ...ENTITY_ALIASES.flatMap(([, patterns]) => patterns),
  ].flatMap((re) => {
    /* extract literal words from simple patterns for stopword purposes */
    const source = re.source
      .replace(/\\b/g, "")
      .replace(/\[\^?[^\]]*\]/g, "")
      .replace(/[()|?*+^$\\]/g, " ")
      .split(/\s+/)
      .filter((w) => /^[a-z'-]+$/.test(w));
    return source;
  })
);

function isDictionaryWord(word: string): boolean {
  return DICTIONARY_WORDS.has(word);
}
