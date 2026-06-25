import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe, GitFork } from "lucide-react";

export default function CompanyDetail({ item }: { item: any }) {
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Company not found</h1>
        <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  const links: { label: string; url: string; icon: any }[] = [];
  if (item.website) links.push({ label: "Website", url: item.website, icon: Globe });
  if (item.github) links.push({ label: "GitHub", url: item.github, icon: GitFork });
  if (item.hf_org) links.push({ label: "HuggingFace", url: item.hf_org, icon: ExternalLink });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Back to home
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full border text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            Company
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
        {item.founded && (
          <p className="text-[13px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">Est. {item.founded}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <l.icon size={13} /> {l.label}
          </a>
        ))}
      </div>

      {item.desc && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">About</h2>
          <p className="text-[14px] text-neutral-700 dark:text-neutral-300 leading-relaxed">{item.desc}</p>
        </section>
      )}

      {item.langs && item.langs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">Languages</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.langs.map((l: string) => (
              <span key={l} className="font-mono text-[10px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1">
                {l}
              </span>
            ))}
          </div>
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

      {item.related_models && item.related_models.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Related Models ({item.models_count || item.related_models.length})
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {item.related_models.map((m: string) => (
              <Link
                key={m}
                href={`/models/${m}`}
                className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors inline-flex items-center gap-1"
              >
                {m} <ExternalLink size={9} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
