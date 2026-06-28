const ARCHS_SUPPORTED = new Set([
  "llama", "gpt2", "whisper", "wav2vec2", "t5", "qwen2", "qwen3",
  "roberta", "xglm", "gemma3_text", "gemma", "bart", "mistral",
  "phi3", "phi", "bloom", "opt", "codegen",
]);

const PIPELINE_MAP: Record<string, string> = {
  "text-generation": "text-generation",
  "automatic-speech-recognition": "automatic-speech-recognition",
  "text-to-speech": "text-to-speech",
  "text2text-generation": "text-generation",
};

const ARCH_ALIASES: Record<string, string> = {
  llama: "llama", gpt2: "gpt2", whisper: "whisper",
  wav2vec2: "wav2vec2", "wav2vec2-bert": "wav2vec2",
  t5: "t5", mt5: "t5", qwen2: "qwen2", qwen3: "qwen3",
  roberta: "roberta", xglm: "xglm",
  gemma3_text: "gemma", gemma: "gemma",
  bart: "bart", mistral: "mistral",
  phi3: "phi", phi: "phi",
  bloom: "bloom", opt: "opt", codegen: "codegen",
};

export function getPipelineType(tags: string[]): string | null {
  for (const t of tags) {
    const key = t.toLowerCase().trim();
    if (key in PIPELINE_MAP) return PIPELINE_MAP[key];
  }
  return null;
}

export function getArchitecture(tags: string[]): string | null {
  for (const t of tags) {
    const key = t.toLowerCase().trim();
    if (ARCHS_SUPPORTED.has(key)) return ARCH_ALIASES[key] || key;
  }
  return null;
}

const NAME_SIZE_HINTS: [RegExp, number][] = [
  [/[_-]?180m[_-]?/i, 180_000_000],
  [/[_-]?400m[_-]?/i, 400_000_000],
  [/[_-]?0\.5b[_-]?/i, 500_000_000],
  [/[_-]?1b[_-]?/i, 1_000_000_000],
  [/[_-]?4b[_-]?/i, 4_000_000_000],
  [/[_-]?7b[_-]?/i, 7_000_000_000],
  [/[_-]?large[_-]?/i, 1_500_000_000],
  [/[_-]?medium[_-]?/i, 760_000_000],
  [/[_-]?small[_-]?/i, 240_000_000],
  [/[_-]?base[_-]?/i, 500_000_000],
];

function estimateParamCount(name: string): number | null {
  for (const [re, count] of NAME_SIZE_HINTS) {
    if (re.test(name)) return count;
  }
  return null;
}

export type SizeCategory = "small" | "medium" | "large" | "unsupported";

export function getModelSizeCategory(
  paramCount: number | null | undefined,
  tags: string[],
  name: string,
): SizeCategory {
  const pipeline = getPipelineType(tags);
  if (!pipeline) return "unsupported";

  const arch = getArchitecture(tags);
  if (!arch) return "unsupported";

  const count = paramCount ?? estimateParamCount(name);
  if (count === null) return "unsupported";
  if (count > 2_000_000_000) return "large";
  if (count > 1_000_000_000) return "medium";
  return "small";
}

export function formatParamCount(n: number | null | undefined): string {
  if (n == null) return "?";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(0) + "M";
  return (n / 1e3).toFixed(0) + "K";
}

export function estimateDownloadMB(n: number | null | undefined): number | null {
  if (n == null) return null;
  return Math.round(n * 0.55 / 1_000_000);
}
