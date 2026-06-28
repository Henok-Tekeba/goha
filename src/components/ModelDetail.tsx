import Link from "next/link";
import { ArrowLeft, ExternalLink, Download, Heart, Cpu, BarChart3, Building2, FileText, Scale, CheckCircle, Database } from "lucide-react";
import ModelTimeline from "./ModelTimeline";
import WatchButton from "./WatchButton";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

function fmtParam(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return String(n);
}

const BADGE_STYLES: Record<string, string> = {
  "b-asr": "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  "b-nmt": "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800",
  "b-llm": "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  "b-ner": "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  "b-emb": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-ds": "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
  "b-co": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-default": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
};

function badgeClass(bc?: string): string {
  return BADGE_STYLES[bc ?? ""] ?? "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700";
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 mb-1">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function ModelDetail({ item, related, timeline }: { item: any; related?: any[]; timeline?: any }) {
  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="text-center py-16">
          <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Model not found</div>
          <p className="text-sm text-neutral-500">This model doesn&apos;t exist or hasn&apos;t been indexed yet.</p>
        </div>
      </div>
    );
  }

  const hfUrl = item.hf_url || (item.id ? `https://huggingface.co/${item.id}` : null);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6">
          <ArrowLeft size={14} /> Back to browse
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClass(item.bc)}`}>
                {item.badge}
              </span>
              {item.verified && (
                <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-full px-1.5 py-0.5 inline-flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
            {hfUrl && (
              <a href={hfUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 transition-colors">
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View on HuggingFace</span>
              </a>
            )}
            {item && (
              <WatchButton item={{ id: item.id || item.name, type: "model", name: item.name, org: item.org || "", badge: item.badge, addedAt: new Date().toISOString() }} />
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {item.name}
          </h1>
          {item.org && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <Building2 size={14} />
              {item.org}
            </div>
          )}

          {item.desc && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{item.desc}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBox icon={<Download size={14} />} label="Downloads" value={fmt(item.dl)} />
          <StatBox icon={<Heart size={14} />} label="Likes" value={fmt(item.likes)} />
          <StatBox icon={<Cpu size={14} />} label="Parameters" value={fmtParam(item.param_count)} />
          <StatBox icon={<BarChart3 size={14} />} label="Growth" value={
            item.growth != null && Math.abs(item.growth) >= 5
              ? `${item.growth > 0 ? "+" : ""}${item.growth}%`
              : "—"
          } />
        </div>

        {/* Timeline */}
        {timeline && <div className="mb-6"><ModelTimeline timeline={timeline} /></div>}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Details">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Pipeline</span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.pipeline_tag || item.type_label || "—"}</span>
                </div>
                {item.license && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1"><Scale size={12} /> License</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">{item.license}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Files</span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{fmt(item.file_count)}</span>
                </div>
                {item.base_model && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Base Model</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 text-right max-w-[200px] truncate">{item.base_model}</span>
                  </div>
                )}
                {item.wer_score && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">WER</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100">{item.wer_score}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Tags & Languages">
              <div className="space-y-3">
                {item.lang && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Language</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-0.5">
                      {item.lang}
                    </span>
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 8).map((t: string) => (
                        <span key={t} className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {item.confirmed_languages && item.confirmed_languages.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Confirmed Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {item.confirmed_languages.map((l: string) => (
                        <span key={l} className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded px-1.5 py-0.5">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          </div>
        </div>

        {/* Training Datasets */}
        {item.training_datasets && item.training_datasets.length > 0 && (
          <Section title="Trained On">
            <div className="flex flex-wrap gap-2">
              {item.training_datasets.map((ds: string) => (
                <span key={ds} className="font-mono text-[10px] text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
                  <Database size={12} className="text-neutral-400" />
                  {ds}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Related Models */}
        {related && related.length > 0 && (
          <Section title="More from this organization">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id || m.name}`}
                  className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${badgeClass(m.bc)}`}>
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">{m.name}</div>
                  <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{m.org}</div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-8">
          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
            <span>Indexed {item.added_at ? new Date(item.added_at).toLocaleDateString() : "recently"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
