"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Mic, MicOff, Copy, Check, Loader2, AlertCircle, FileAudio } from "lucide-react";

export default function ASRInterface({ modelId }: { modelId: string }) {
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [loadProgress, setLoadProgress] = useState("");
  const [error, setError] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [result, setResult] = useState<{ text: string; chunks?: { text: string; timestamp: [number, number] }[] } | null>(null);
  const [recording, setRecording] = useState(false);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);
  const pipelineRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadModel = useCallback(async () => {
    setLoadState("loading");
    setLoadProgress("Downloading model…");
    setError("");
    try {
      const { pipeline } = await import("@huggingface/transformers");
      const transcriber = await pipeline("automatic-speech-recognition", modelId, {
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
      pipelineRef.current = transcriber;
      setLoadState("ready");
    } catch (e: any) {
      setError(e?.message ?? "Failed to load model");
      setLoadState("error");
    }
  }, [modelId]);

  const transcribe = useCallback(async (audioBuffer: AudioBuffer) => {
    if (!pipelineRef.current) return;
    setTranscribing(true);
    setError("");
    setResult(null);
    try {
      const float32 = audioBuffer.getChannelData(0);
      const out = await pipelineRef.current(float32, {
        return_timestamps: true,
      });
      if (Array.isArray(out)) {
        setResult(out[0]);
      } else {
        setResult(out);
      }
    } catch (e: any) {
      setError(e?.message ?? "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    if (loadState !== "ready") await loadModel();
    if (!pipelineRef.current) return;
    const arrayBuffer = await file.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    transcribe(audioBuffer);
  }, [loadState, loadModel, transcribe]);

  const toggleRecording = useCallback(async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (loadState !== "ready") await loadModel();
    if (!pipelineRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = new AudioContext();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        audioCtx.close();
        transcribe(audioBuffer);
      };

      recorder.start();
      setRecording(true);
    } catch (e: any) {
      setError("Microphone access denied");
    }
  }, [recording, loadState, loadModel, transcribe]);

  const copyResult = useCallback(() => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <div className="flex flex-col gap-3">
      {loadState === "idle" && (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors cursor-pointer"
          >
            <FileAudio size={24} className="text-neutral-400" />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Drop audio or click to upload</span>
          </button>
          <button
            onClick={loadModel}
            className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 h-fit"
          >
            <Loader2 size={14} /> Load Model
          </button>
        </div>
      )}

      {loadState === "loading" && (
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Loader2 size={20} className="animate-spin mx-auto mb-2 text-neutral-400" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{loadProgress}</p>
          </div>
        </div>
      )}

      {loadState === "error" && (
        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <AlertCircle size={20} className="mx-auto mb-2 text-rose-500" />
            <p className="text-xs text-rose-600 dark:text-rose-400 mb-1">Failed to load model</p>
            <p className="text-[10px] text-neutral-500 mb-2">{error}</p>
            <button onClick={loadModel} className="text-xs text-emerald-600 dark:text-emerald-400 underline">Retry</button>
          </div>
        </div>
      )}

      {loadState === "ready" && (
        <>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Upload size={12} /> Upload audio
            </button>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 border transition-colors ${
                recording
                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800"
                  : "text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {recording ? <MicOff size={12} /> : <Mic size={12} />}
              {recording ? "Stop" : "Record"}
            </button>
          </div>

          {fileName && (
            <p className="text-[10px] text-neutral-500 truncate">{fileName}</p>
          )}

          {recording && (
            <div className="flex items-center gap-2 py-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              <span className="text-xs text-rose-500">Recording…</span>
            </div>
          )}

          {transcribing && (
            <div className="flex items-center gap-2 py-2 text-xs text-neutral-500">
              <Loader2 size={12} className="animate-spin" />
              Transcribing…
            </div>
          )}

          {result && (
            <div className="relative bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3">
              <button
                onClick={copyResult}
                className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 pr-6">{result.text}</p>
              {result.chunks && result.chunks.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {result.chunks.slice(0, 10).map((c, i) => (
                    <p key={i} className="text-[10px] text-neutral-500 font-mono">
                      [{c.timestamp[0].toFixed(1)}s] {c.text}
                    </p>
                  ))}
                  {result.chunks.length > 10 && (
                    <p className="text-[10px] text-neutral-400">…{result.chunks.length - 10} more</p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-[10px] text-rose-500">{error}</p>}
        </>
      )}
    </div>
  );
}
