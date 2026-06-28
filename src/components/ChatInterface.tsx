"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Trash2, Loader2, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "goha:chat:history";

export default function ChatInterface({ modelId }: { modelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadProgress, setLoadProgress] = useState("");
  const [error, setError] = useState("");
  const [pipeline, setPipeline] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<any>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`${STORAGE_KEY}:${modelId}`);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [modelId]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`${STORAGE_KEY}:${modelId}`, JSON.stringify(messages));
    } catch {}
  }, [messages, modelId]);

  const loadModel = useCallback(async () => {
    setLoadState("loading");
    setLoadProgress("Downloading model…");
    setError("");
    try {
      const { pipeline } = await import("@huggingface/transformers");
      const gen = await pipeline("text-generation", modelId, {
        dtype: "q4",
        device: "wasm",
        progress_callback: (p: any) => {
          if (p.status === "progress" && p.total) {
            const pct = Math.round((p.loaded / p.total) * 100);
            const mb = (p.total / 1_000_000).toFixed(0);
            setLoadProgress(`Downloading ${mb}MB… ${pct}%`);
          }
        },
      });
      pipelineRef.current = gen;
      setPipeline(gen);
      setLoadState("ready");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load model");
      setLoadState("error");
    }
  }, [modelId]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;
    setInput("");
    setError("");

    if (!pipelineRef.current) {
      await loadModel();
      if (!pipelineRef.current) return;
    }

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setGenerating(true);

    try {
      const prompt = newMessages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n") + "\nAssistant:";

      const result = await pipelineRef.current(prompt, {
        max_new_tokens: 512,
        do_sample: true,
        temperature: 0.7,
        top_p: 0.9,
      });

      let reply = "";
      if (Array.isArray(result)) {
        const full = result[0]?.generated_text ?? "";
        reply = full.slice(prompt.length).trim();
      } else if (typeof result === "string") {
        reply = result.slice(prompt.length).trim();
      }

      if (!reply) reply = "(no response)";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(e?.message ?? "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [input, generating, messages, loadModel]);

  const clear = useCallback(() => {
    setMessages([]);
    sessionStorage.removeItem(`${STORAGE_KEY}:${modelId}`);
  }, [modelId]);

  return (
    <div className="flex flex-col min-h-[320px]">
      {loadState === "idle" && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              Load the model to start chatting
            </p>
            <button
              onClick={loadModel}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5"
            >
              <Loader2 size={14} /> Load Model
            </button>
          </div>
        </div>
      )}

      {loadState === "loading" && (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-neutral-400" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{loadProgress}</p>
          </div>
        </div>
      )}

      {loadState === "error" && (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center max-w-sm">
            <AlertCircle size={20} className="mx-auto mb-2 text-rose-500" />
            <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Failed to load model</p>
            <p className="text-[10px] text-neutral-500 mb-3">{error}</p>
            <button
              onClick={loadModel}
              className="text-xs text-emerald-600 dark:text-emerald-400 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loadState === "ready" && (
        <div className="flex-1 space-y-3 mb-4 max-h-[320px] overflow-y-auto no-scrollbar px-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-neutral-800 dark:text-neutral-200"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {generating && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
                <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {error && loadState === "ready" && (
        <p className="text-[10px] text-rose-500 mb-2">{error}</p>
      )}

      <div className="flex items-end gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-3">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={loadState === "ready" ? "Type a message…" : "Load the model first"}
            disabled={loadState !== "ready" || generating}
            rows={1}
            className="w-full text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 resize-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600 disabled:opacity-40"
          />
        </div>
        <button
          onClick={send}
          disabled={loadState !== "ready" || generating || !input.trim()}
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 text-white disabled:text-neutral-400 transition-colors"
        >
          <Send size={14} />
        </button>
        <button
          onClick={clear}
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
          title="Clear conversation"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
