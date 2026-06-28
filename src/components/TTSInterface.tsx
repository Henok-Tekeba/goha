"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play, Square, Loader2, Volume2 } from "lucide-react";

const LANG_MAP: Record<string, string> = {
  AM: "am-ET", am: "am-ET", amh: "am-ET",
  OM: "om-ET", om: "om-ET",
  TI: "ti-ET", ti: "ti-ET",
  GZ: "gez-ET", gz: "gez-ET",
  EN: "en-US", en: "en-US",
};

export default function TTSInterface({ modelId, lang }: { modelId: string; lang?: string | null }) {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = LANG_MAP[lang || ""] || LANG_MAP.AM || "am-ET";
    utterance.lang = langCode;

    const langMatch = voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
    if (langMatch) utterance.voice = langMatch;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, lang, voices]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  if (!supported) {
    return (
      <p className="text-xs text-amber-600 dark:text-amber-400">
        Text-to-speech is not supported in this browser.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Volume2 size={14} className="text-neutral-400" />
        <span className="font-mono text-[10px] text-neutral-500 uppercase">{lang || "AM"}</span>
        <span className="text-[10px] text-neutral-400">
          {voices.length > 0 ? `${voices.length} voice(s) available` : "loading voices…"}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to speak…"
        rows={3}
        className="w-full text-sm bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 resize-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600"
      />

      <div className="flex items-center gap-2">
        <button
          onClick={speaking ? stop : speak}
          disabled={!text.trim()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900 disabled:opacity-40 transition-colors"
        >
          {speaking ? <Square size={14} /> : <Play size={14} />}
          {speaking ? "Stop" : "Speak"}
        </button>
        {speaking && (
          <span className="flex items-center gap-1 text-xs text-emerald-500">
            <Loader2 size={10} className="animate-spin" />
            Speaking…
          </span>
        )}
      </div>
    </div>
  );
}
