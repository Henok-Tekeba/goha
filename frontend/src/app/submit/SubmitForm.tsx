"use client";

import { useState } from "react";

const types = [
  { key: "model", label: "Model" },
  { key: "dataset", label: "Dataset" },
  { key: "company", label: "Company" },
  { key: "researcher", label: "Researcher" },
  { key: "paper", label: "Paper" },
];

const languages = ["Amharic", "Afaan Oromo", "Tigrinya", "Ge'ez", "Somali", "Other"];

const urlLabels: Record<string, string> = {
  model: "HuggingFace URL",
  dataset: "HuggingFace URL",
  company: "Website",
  researcher: "Website",
  paper: "arXiv URL",
};

const urlPlaceholders: Record<string, string> = {
  model: "https://huggingface.co/username/model-name",
  dataset: "https://huggingface.co/datasets/username/dataset-name",
  company: "https://example.com",
  researcher: "https://example.com",
  paper: "https://arxiv.org/abs/xxxx.xxxxx",
};

export default function SubmitForm() {
  const [type, setType] = useState("model");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const toggleLang = (lang: string) => {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: name.trim(),
          url: url.trim(),
          description: desc.trim(),
          languages: selectedLangs,
          submitter_name: submitterName.trim(),
          submitter_email: submitterEmail.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-emerald-600 dark:bg-emerald-500  border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 tracking-tight mb-3">
          Thank you{submitterName ? `, ${submitterName}` : ""}.
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 max-w-sm mx-auto leading-relaxed">
          We&rsquo;ll review your submission and add it within 48 hours.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-sm mx-auto leading-relaxed">
          Ethiopian AI is more visible because of contributors like you.
        </p>
        <a
          href="/"
          className="inline-block text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 px-6 py-2.5 rounded-full hover:bg-[#047857] transition-colors"
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <label className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2.5">
          Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`text-sm sm:text-xs px-4 sm:px-3.5 py-2 sm:py-1.5 rounded-full border transition-all ${
                type === t.key
                  ? "text-neutral-900 dark:text-neutral-100 border-foreground bg-white dark:bg-neutral-900 font-medium"
                  : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#a3a3a3]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <label htmlFor="name" className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none focus:border-green focus:ring-[3px] focus:ring-green/10 transition-all placeholder:text-[#c4c4c4]"
          placeholder="e.g. Aleph ፩"
        />
      </fieldset>

      <fieldset>
        <label htmlFor="url" className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          {urlLabels[type]}
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none focus:border-green focus:ring-[3px] focus:ring-green/10 transition-all placeholder:text-[#c4c4c4]"
          placeholder={urlPlaceholders[type]}
        />
      </fieldset>

      <fieldset>
        <label htmlFor="desc" className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          Description
        </label>
        <textarea
          id="desc"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none focus:border-green focus:ring-[3px] focus:ring-green/10 transition-all placeholder:text-[#c4c4c4] resize-y"
          placeholder="Tell us about this entry..."
        />
      </fieldset>

      <fieldset>
        <label className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2.5">
          Languages covered
        </label>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => {
            const active = selectedLangs.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLang(lang)}
                className={`text-sm sm:text-xs px-3.5 sm:px-3 py-2 sm:py-1.5 rounded-full border transition-all ${
                  active
                    ? "text-[#065f46] bg-emerald-600 dark:bg-emerald-500  border-emerald-200 dark:border-emerald-800 font-medium"
                    : "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-[#a3a3a3]"
                }`}
              >
                {lang}
                {active && <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">&check;</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <label htmlFor="submitter" className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          Your name <span className="text-[#c4c4c4] normal-case font-normal tracking-normal">(optional)</span>
        </label>
        <input
          id="submitter"
          type="text"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none focus:border-green focus:ring-[3px] focus:ring-green/10 transition-all placeholder:text-[#c4c4c4]"
          placeholder="Your name"
        />
      </fieldset>

      <fieldset>
        <label htmlFor="email" className="block font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
          Email <span className="text-[#c4c4c4] normal-case font-normal tracking-normal">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={submitterEmail}
          onChange={(e) => setSubmitterEmail(e.target.value)}
          className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-900 outline-none focus:border-green focus:ring-[3px] focus:ring-green/10 transition-all placeholder:text-[#c4c4c4]"
          placeholder="you@example.com"
        />
      </fieldset>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 font-mono">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 px-6 py-2.5 rounded-full hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit for review"}
        </button>
        <a
          href="/"
          className="text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 px-6 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-[#a3a3a3] hover:text-neutral-900 dark:hover:text-neutral-100 transition-all"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
