import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Heart, Database, Globe } from "lucide-react";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

export default function DatasetDetail({ item }: { item: any }) {
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Dataset not found</h1>
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800">
              Dataset
            </span>
            {item.isNew && (
              <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800">
                New
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight">
            {item.name}
          </h1>
          {item.org && (
            <p className="text-[13px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">{item.org}</p>
          )}
        </div>
        {item.hf_url && (
          <a
            href={item.hf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <ExternalLink size={13} /> Open on HF
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-8">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Download size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Downloads / mo</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{fmt(item.downloads_monthly ?? item.dl)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Heart size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Likes</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{fmt(item.likes)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Globe size={16} className="text-neutral-400 dark:text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Languages</div>
            <div className="text-[14px] font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">{item.langs?.length ? item.langs.join(" · ") : "—"}</div>
          </div>
        </div>
      </div>

      {item.description && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Description</h2>
          <p className="text-[14px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        </section>
      )}

      {item.tags && item.tags.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t: string) => (
              <span key={t} className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
