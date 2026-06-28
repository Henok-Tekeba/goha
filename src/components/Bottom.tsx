"use client";

import { useEffect, useState } from "react";
import type { Stats } from "@/types";
import SchemaModal from "./SchemaModal";
import { fetchActivityFeed } from "@/lib/github";

export default function Bottom({ stats }: { stats: Stats }) {
  const [feedCount, setFeedCount] = useState(0);
  const [schemaOpen, setSchemaOpen] = useState(false);

  useEffect(() => {
    fetchActivityFeed()
      .then((d) => {
        const items: any[] = Array.isArray(d) ? d : (d as any)?.data || [];
        setFeedCount(items.length > 0 ? items[0].id || 0 : 0);
      })
      .catch(() => {});
  }, []);

  const ecosystemGrowth = feedCount > 0 ? Math.min(99, Math.round((feedCount / Math.max(stats.models + stats.datasets, 1)) * 100)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-neutral-200 dark:bg-neutral-800">
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-6">
        <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          Contribute
        </div>
        <div className="text-base sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight leading-tight">
          Know something we don&apos;t?
        </div>
        <div className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
          Submit a JSON file through a PR. CI checks the schema automatically.
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.open("https://github.com/YOUR_GITHUB_USERNAME/goha.et", "_blank")}
            className="text-sm sm:text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 px-5 sm:px-4 py-2 sm:py-1.5 rounded-full transition-colors"
          >
            Open a PR
          </button>
          <button
            type="button"
            onClick={() => setSchemaOpen(true)}
            className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-950 px-5 sm:px-4 py-2 sm:py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all"
          >
            View schema
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-6">
        <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
          By the numbers
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-3.5">
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.models}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">models indexed</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              <span className="text-emerald-600 dark:text-emerald-400">{stats.languages}</span>
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">languages covered</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.companies}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">active companies</div>
          </div>
          <div>
            <div className="text-2xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {stats.research}
            </div>
            <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">researchers</div>
          </div>
          <div className="col-span-2 border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-1">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500">Ecosystem activity</div>
              <div className="flex items-center gap-2">
                {ecosystemGrowth !== 0 && Math.abs(ecosystemGrowth) >= 5 && (
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15V6H9"/><path d="m6 18 9-9"/></svg>
                    {ecosystemGrowth}% growth
                  </span>
                )}
                <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">{feedCount} events tracked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-950 p-6 sm:p-6 col-span-1 sm:col-span-2 border-t border-neutral-200 dark:border-neutral-800">
        <NewsletterSignup />
      </div>
      <SchemaModal open={schemaOpen} onClose={() => setSchemaOpen(false)} />
    </div>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const formId = process.env.NEXT_PUBLIC_GFORM_ID;
  const entryId = process.env.NEXT_PUBLIC_GFORM_ENTRY;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (!formId || !entryId) {
      setStatus("success");
      setEmail("");
      return;
    }
    setStatus("loading");
    try {
      const params = new URLSearchParams({ [entryId]: email.trim() });
      await fetch(`https://docs.google.com/forms/d/e/${formId}/formResponse`, {
        method: "POST",
        mode: "no-cors",
        body: params,
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="font-mono text-[11px] sm:text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
        Stay updated
      </div>
      <div className="text-base sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight leading-tight">
        Get weekly updates on new models, datasets, and research
      </div>
      <p className="text-sm sm:text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5 max-w-md mx-auto">
        A short email every Sunday with everything new in Ethiopian AI.
      </p>
      {status === "success" ? (
        <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
          You&apos;re subscribed! Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 focus:ring-[3px] focus:ring-emerald-500/10 dark:focus:ring-emerald-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}
      {status === "error" && (
        <div className="font-mono text-[11px] text-red-500 mt-2">
          Something went wrong. Try again or email us directly.
        </div>
      )}
    </div>
  );
}