"use client";

import { useEffect, useState } from "react";

const MODEL_SCHEMA = `{
  "id": "author/model-name",
  "name": "Human Readable Name",
  "type": "ASR | LLM | Translation | Embeddings | NER | TTS | Classification",
  "languages": ["am", "om", "ti", "gz"],
  "author": {
    "name": "string",
    "huggingface": "string"
  },
  "links": {
    "huggingface": "https://huggingface.co/..."
  },
  "description": "One sentence description",
  "tags": ["array", "of", "strings"]
}`;

const DATASET_SCHEMA = `{
  "id": "author/dataset-name",
  "name": "Human Readable Name",
  "type": "Dataset",
  "languages": ["am", "om", "ti", "gz"],
  "author": {
    "name": "string",
    "huggingface": "string"
  },
  "links": {
    "huggingface": "https://huggingface.co/...",
    "github": "https://github.com/..."
  },
  "description": "One sentence description",
  "tags": ["array", "of", "strings"]
}`;

const COMPANY_SCHEMA = `{
  "id": "company-slug",
  "name": "Company Name",
  "website": "https://example.com",
  "github": "https://github.com/org",
  "hf_org": "https://huggingface.co/org",
  "description": "Short description",
  "founded": "2024",
  "tags": ["array", "of", "strings"]
}`;

const TABS: { key: "model" | "dataset" | "company"; label: string; schema: string }[] = [
  { key: "model", label: "Model", schema: MODEL_SCHEMA },
  { key: "dataset", label: "Dataset", schema: DATASET_SCHEMA },
  { key: "company", label: "Company", schema: COMPANY_SCHEMA },
];

export default function SchemaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"model" | "dataset" | "company">("model");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const active = TABS.find((t) => t.key === tab)!;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(active.schema);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[1px]"
      />
      <div className="relative bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div>
            <div className="text-[14px] sm:text-[13px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
              Contribution Schema
            </div>
            <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 uppercase tracking-wider">
              JSON · pick a type
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full inline-flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-5 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 shrink-0">
          {TABS.map((t) => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setCopied(false);
                }}
                className={`text-sm sm:text-[11px] px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-full border whitespace-nowrap transition-all ${
                  isActive
                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 font-medium"
                    : "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 overflow-auto p-5 sm:p-6 bg-neutral-50 dark:bg-neutral-900">
          <button
            type="button"
            onClick={onCopy}
            aria-label="Copy schema"
            className="absolute top-7 right-7 z-10 text-[10px] sm:text-[9px] font-mono text-neutral-400 dark:text-neutral-500 hover:text-white border border-neutral-700 bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-700 rounded px-2 py-1 inline-flex items-center gap-1 transition-colors"
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
          <pre className="bg-neutral-900 dark:bg-black text-emerald-400 dark:text-emerald-300 rounded-lg p-4 sm:p-5 pr-20 overflow-x-auto font-mono text-[12px] sm:text-[11px] leading-relaxed whitespace-pre">
            <code>{active.schema}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}