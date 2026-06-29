"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ThumbsUp, Search, Grid3X3 } from "lucide-react";

const SDKS = ["gradio", "streamlit", "static", "docker"] as const;

const SDK_ICON: Record<string, string> = {
  gradio: "🎨",
  streamlit: "📊",
  static: "📄",
  docker: "🐳",
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sdkFilter, setSdkFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<"likes" | "name">("likes");

  useEffect(() => {
    import("@/lib/github").then(({ fetchSpaces }) =>
      fetchSpaces().then((d) => {
        setSpaces(d.data || []);
        setLoading(false);
      }).catch(() => setLoading(false))
    );
  }, []);

  const filtered = useMemo(() => {
    let result = [...spaces];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name?.toLowerCase().includes(q) || s.id?.toLowerCase().includes(q));
    }
    if (sdkFilter) {
      result = result.filter((s) => s.sdk === sdkFilter);
    }
    result.sort((a, b) => {
      if (sort === "likes") return (b.likes ?? 0) - (a.likes ?? 0);
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
    return result;
  }, [spaces, search, sdkFilter, sort]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            Spaces
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {loading ? "Loading…" : `${filtered.length} of ${spaces.length} HuggingFace Spaces`}
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search spaces…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-400 dark:focus:border-emerald-600"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-emerald-400"
          >
            <option value="likes">Most liked</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* SDK filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSdkFilter(null)}
            className={`font-mono text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
              !sdkFilter
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
            }`}
          >
            All
          </button>
          {SDKS.map((sdk) => (
            <button
              key={sdk}
              onClick={() => setSdkFilter(sdkFilter === sdk ? null : sdk)}
              className={`font-mono text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                sdkFilter === sdk
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
              }`}
            >
              {SDK_ICON[sdk]} {sdk}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Grid3X3 size={32} className="mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm text-neutral-500">No spaces match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((space) => (
              <a
                key={space.id}
                href={space.url || `https://huggingface.co/spaces/${space.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{SDK_ICON[space.sdk] || "🧩"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {space.name}
                      </p>
                      <p className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500 truncate">
                        {space.id}
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={12} className="shrink-0 text-neutral-300 group-hover:text-neutral-500 transition-colors mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 uppercase">
                    {space.sdk || "—"}
                  </span>
                  {(space.likes ?? 0) > 0 && (
                    <span className="font-mono text-[9px] text-neutral-400 flex items-center gap-1">
                      <ThumbsUp size={10} /> {space.likes}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
