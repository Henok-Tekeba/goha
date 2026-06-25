import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Users } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PaperDetail({ item }: { item: any }) {
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Paper not found</h1>
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
            <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-800">
              Paper
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight">
            {item.title || item.name}
          </h1>
          {item.authors && item.authors.length > 0 && (
            <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-2">
              {item.authors.join(", ")}
            </p>
          )}
        </div>
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <ExternalLink size={13} /> Open on arXiv
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-8 text-[13px] text-neutral-500 dark:text-neutral-400">
        {item.published_date && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {fmtDate(item.published_date)}
          </span>
        )}
        {item.authors && (
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} />
            {item.authors.length} author{item.authors.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {item.abstract && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Abstract</h2>
          <p className="text-[14px] text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.abstract}</p>
        </section>
      )}

      {item.categories && item.categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Categories</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.categories.map((c: string) => (
              <span key={c} className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
