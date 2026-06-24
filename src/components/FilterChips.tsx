"use client";

const languages = ["all", "amharic", "oromo", "tigrinya", "geez"];

const labels: Record<string, string> = {
  all: "All",
  amharic: "Amharic",
  oromo: "Afaan Oromo",
  tigrinya: "Tigrinya",
  geez: "Ge'ez",
};

export default function FilterChips({
  activeLang,
  onLangChange,
}: {
  activeLang: string;
  onLangChange: (lang: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 px-4 sm:px-6 py-2.5 sm:py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto no-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
      <span className="font-mono text-[9px] sm:text-[9px] text-neutral-400 dark:text-neutral-500 mr-0.5 whitespace-nowrap uppercase tracking-wider">
        lang
      </span>
      {languages.map((l) => (
        <button
          key={l}
          onClick={() => onLangChange(l)}
          className={`text-[11px] sm:text-[11px] px-2 sm:px-2.5 py-1 sm:py-1 rounded-full border whitespace-nowrap transition-all shrink-0 ${
            activeLang === l
              ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 font-medium"
              : "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}