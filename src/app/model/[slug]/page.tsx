"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchModels, fetchDatasets } from "@/lib/github";
import type { Item } from "@/types";
import Sparkline from "@/components/Sparkline";
import { ArrowLeft, ExternalLink, BarChart3, Heart, Download, Tag, Building2, BookOpen, Cpu, Database, FileText, Layers, Scale, CheckCircle } from "lucide-react";

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

function fmtParam(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

const BADGE_STYLES: Record<string, string> = {
  "b-asr": "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800",
  "b-nmt": "text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800",
  "b-llm": "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950 border-violet-200 dark:border-violet-800",
  "b-ner": "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
  "b-emb": "text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700",
  "b-ds": "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border-teal-200 dark:border-teal-800",
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

function MiniCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/model/${encodeURIComponent(item.id || item.name)}`}
      className="block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${badgeClass(item.bc)}`}>
          {item.badge}
        </span>
      </div>
      <div className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate">{item.name}</div>
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{item.org}</div>
    </Link>
  );
}

export default function ModelDetailPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const [model, setModel] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mRes, dRes] = await Promise.all([fetchModels(), fetchDatasets()]);
        if (cancelled) return;
        const allModels = mRes?.data || [];
        const found = allModels.find((m: any) => m.id === slug || m.name === slug);
        if (found) {
          setModel(found);
          const sameOrg = allModels.filter((m: any) => m.org === found.org && m.id !== found.id).slice(0, 4);
          setRelated(sameOrg);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="skeleton h-6 w-32 rounded mb-8" />
        <div className="skeleton h-8 w-3/4 rounded mb-2" />
        <div className="skeleton h-4 w-1/3 rounded mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
        <div className="skeleton h-40 rounded-xl mb-4" />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="text-center py-16">
          <div className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Model not found</div>
          <p className="text-sm text-neutral-500">This model doesn{"'"}t exist or hasn{"'"}t been indexed yet.</p>
        </div>
      </div>
    );
  }

  const pipelineLabel = model.pipeline_tag || model.type_label || "";
  const hfUrl = model.hf_url || (model.id ? `https://huggingface.co/${model.id}` : null);

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
              <span className={`font-mono text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClass(model.bc)}`}>
                {model.badge}
              </span>
              {model.verified && (
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
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-1">
            {model.name}
          </h1>
          {model.org && (
            <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              <Building2 size={14} />
              {model.org}
            </div>
          )}

          {model.desc && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{model.desc}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBox icon={<Download size={14} />} label="Downloads" value={fmt(model.dl)} />
          <StatBox icon={<Heart size={14} />} label="Likes" value={fmt(model.likes)} />
          <StatBox icon={<Cpu size={14} />} label="Parameters" value={fmtParam(model.param_count)} />
          <StatBox icon={<BarChart3 size={14} />} label="Growth" value={
            model.growth != null && Math.abs(model.growth) >= 5
              ? `${model.growth > 0 ? "+" : ""}${model.growth}%`
              : "—"
          } />
        </div>

        {/* Sparkline */}
        {model.sparkline && model.sparkline.points?.length >= 2 && (
          <Section title="Download Trend">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
              <Sparkline sparkline={model.sparkline} width={600} height={80} fill />
              {model.sparkline.timestamps && (
                <div className="flex justify-between mt-2 font-mono text-[9px] text-neutral-400">
                  <span>{model.sparkline.timestamps[0]}</span>
                  <span>{model.sparkline.timestamps[model.sparkline.timestamps.length - 1]}</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Details">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Pipeline</span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{pipelineLabel || "—"}</span>
                </div>
                {model.license && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1"><Scale size={12} /> License</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">{model.license}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider flex items-center gap-1"><FileText size={12} /> Files</span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">{fmt(model.file_count)}</span>
                </div>
                {model.base_model && (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">Base Model</span>
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 text-right max-w-[200px] truncate">{model.base_model}</span>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5">
            <Section title="Tags & Languages">
              <div className="space-y-3">
                {model.lang && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Language</span>
                    <span className="font-mono text-[11px] font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-2 py-0.5">
                      {model.lang}
                    </span>
                  </div>
                )}
                {model.tags && model.tags.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {model.tags.slice(0, 8).map((t: string) => (
                        <span key={t} className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {model.confirmed_languages && model.confirmed_languages.length > 0 && (
                  <div>
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-2 block">Confirmed Languages</span>
                    <div className="flex flex-wrap gap-1">
                      {model.confirmed_languages.map((l: string) => (
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
        {model.training_datasets && model.training_datasets.length > 0 && (
          <Section title="Trained On">
            <div className="flex flex-wrap gap-2">
              {model.training_datasets.map((ds: string) => (
                <span key={ds} className="font-mono text-[10px] text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
                  <Database size={12} className="text-neutral-400" />
                  {ds}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Related Models */}
        {related.length > 0 && (
          <Section title="More from this organization">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {related.map((m) => <MiniCard key={m.id} item={m} />)}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-8">
          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
            <span>Indexed {model.added_at ? new Date(model.added_at).toLocaleDateString() : "recently"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
