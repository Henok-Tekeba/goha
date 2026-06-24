"use client";

function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [];
  const around = new Set<number>([1, total, current - 1, current, current + 1]);
  for (let p = 1; p <= total; p++) {
    if (around.has(p)) pages.push(p);
  }
  const out: (number | "…")[] = [];
  for (let i = 0; i < pages.length; i++) {
    out.push(pages[i] as number);
    if (i < pages.length - 1 && (pages[i + 1] as number) - (pages[i] as number) > 1) {
      out.push("…");
    }
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = buildPages(page, totalPages);
  const baseCls =
    "text-sm sm:text-[11px] px-3 sm:px-2.5 py-1.5 sm:py-1 rounded-full border whitespace-nowrap transition-all shrink-0 min-w-[28px] text-center";
  const inactive =
    "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100";
  const active = "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 font-medium";
  const disabled = "text-neutral-400 dark:text-neutral-500 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-40 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 sm:px-6 py-6">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={`${baseCls} ${page <= 1 ? disabled : inactive}`}
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            className="text-sm sm:text-[11px] text-neutral-400 dark:text-neutral-500 px-1 select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${baseCls} ${p === page ? active : inactive}`}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={`${baseCls} ${page >= totalPages ? disabled : inactive}`}
      >
        Next
      </button>
    </div>
  );
}