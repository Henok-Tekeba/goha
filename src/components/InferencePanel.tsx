"use client";

import { useState } from "react";
import { Cpu, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import ChatInterface from "./ChatInterface";
import ASRInterface from "./ASRInterface";
import TTSInterface from "./TTSInterface";
import { getPipelineType, getModelSizeCategory, formatParamCount, estimateDownloadMB } from "@/lib/inference";

export default function InferencePanel({ model }: { model: any }) {
  const [open, setOpen] = useState(false);
  const tags = model.tags || [];
  const pipeline = getPipelineType(tags);
  const size = getModelSizeCategory(model.param_count, tags, model.name);
  const hfUrl = model.hf_url || (model.id ? `https://huggingface.co/${model.id}` : null);

  if (!pipeline) return null;

  const isLarge = size === "large";
  const isUnsupported = size === "unsupported";
  const isMedium = size === "medium";
  const isSmall = size === "small";

  const pipelineLabel = {
    "text-generation": "Chat",
    "automatic-speech-recognition": "Speech-to-Text",
    "text-to-speech": "Text-to-Speech",
  }[pipeline] || pipeline;

  const pipelineIcon = {
    "text-generation": "💬",
    "automatic-speech-recognition": "🎤",
    "text-to-speech": "🔊",
  }[pipeline] || "⚡";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 sm:px-7 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{pipelineIcon}</span>
          <div>
            <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Try Inference
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{pipelineLabel}</span>
              {isSmall && (
                <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-full px-1.5 py-0.5">
                  In-browser
                </span>
              )}
              {isMedium && (
                <span className="font-mono text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-full px-1.5 py-0.5">
                  Large model
                </span>
              )}
              {(isLarge || isUnsupported) && (
                <span className="font-mono text-[9px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full px-1.5 py-0.5">
                  Not available
                </span>
              )}
            </div>
          </div>
        </div>
        {open ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronRight size={16} className="text-neutral-400" />}
      </button>

      {open && (
        <div className="px-5 sm:px-7 pb-5 sm:pb-7 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          {isLarge && (
            <div className="text-center py-6">
              <div className="text-2xl mb-2">⚡</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                This model has {formatParamCount(model.param_count)} parameters
                and is too large to run in your browser.
              </p>
              {hfUrl && (
                <a
                  href={hfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 mt-3 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                >
                  Try on HuggingFace <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {isUnsupported && (
            <div className="text-center py-6">
              <div className="text-2xl mb-2">🔧</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                This model uses a custom architecture that isn't supported for in-browser inference.
              </p>
              {hfUrl && (
                <a
                  href={hfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 mt-3 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                >
                  View on HuggingFace <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}

          {isSmall && (
            <div>
              {pipeline === "text-generation" && <ChatInterface modelId={model.id || model.name} />}
              {pipeline === "automatic-speech-recognition" && <ASRInterface modelId={model.id || model.name} />}
              {pipeline === "text-to-speech" && <TTSInterface modelId={model.id || model.name} lang={model.lang} />}
            </div>
          )}

          {isMedium && (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  This model has {formatParamCount(model.param_count)} parameters.
                  {estimateDownloadMB(model.param_count) && (
                    <> It will download ~{estimateDownloadMB(model.param_count)}MB to your browser.</>
                  )}
                  Click the button below to proceed.
                </span>
              </div>
              {pipeline === "text-generation" && <ChatInterface modelId={model.id || model.name} />}
              {pipeline === "automatic-speech-recognition" && <ASRInterface modelId={model.id || model.name} />}
              {pipeline === "text-to-speech" && <TTSInterface modelId={model.id || model.name} lang={model.lang} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
