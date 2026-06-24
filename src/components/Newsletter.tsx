"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data?.error || "Something went wrong");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center">
        <div className="font-mono text-[10px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-full px-2 py-0.5 inline-block uppercase tracking-wider">
          weekly digest
        </div>
        {status !== "success" ? (
          <>
            <h2 className="text-[20px] sm:text-[22px] font-medium tracking-tight mt-3 leading-tight text-neutral-900 dark:text-neutral-100">
              Get Ethiopian AI updates every Monday.
            </h2>
            <p className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 max-w-md mx-auto">
              New models, datasets and papers across Amharic, Oromo, Tigrinya and Ge&rsquo;ez — one short email a week.
            </p>
            <form
              onSubmit={onSubmit}
              className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-2 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@example.com"
                disabled={status === "loading"}
                className="flex-1 text-sm sm:text-xs px-4 sm:px-3 py-2 sm:py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                className="text-sm sm:text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 px-5 sm:px-4 py-2 sm:py-2 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <div className="font-mono text-[10px] text-red-500 mt-3">{errorMsg}</div>
            )}
            <div className="font-mono text-[10px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mt-3">
              No spam. Unsubscribe anytime.
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[20px] sm:text-[22px] font-medium tracking-tight mt-3 leading-tight text-neutral-900 dark:text-neutral-100">
              You&rsquo;re in.
            </h2>
            <p className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 max-w-md mx-auto">
              Every Monday, straight to your inbox.
            </p>
            <div className="inline-flex items-center gap-1.5 mt-4 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] sm:text-[10px]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Subscribed
            </div>
          </>
        )}
      </div>
    </div>
  );
}