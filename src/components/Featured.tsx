"use client";

export default function Featured() {
  return (
    <div className="px-5 sm:px-6 py-4 bg-[#fafafa] border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
        Featured this week
      </div>
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 sm:p-[18px_20px] flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-5 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,.06)] transition-shadow">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="font-mono text-[9px] font-medium text-[#7c3aed] bg-[#faf5ff] border border-[#ddd6fe] px-2 py-0.5 rounded-full">LLM</span>
            <span className="font-mono text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-600 dark:bg-emerald-500  border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">↑ New</span>
          </div>
          <div className="text-base sm:text-[15px] font-medium text-neutral-900 dark:text-neutral-100 mb-1 tracking-tight">Aleph ፩</div>
          <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mb-2.5">Addis AI &middot; Addis Ababa, Ethiopia</div>
          <div className="text-sm sm:text-xs text-[#525252] leading-relaxed mb-3">
            The first foundational large language model built natively for Ethiopian languages.
            Instruction-tuned on Amharic, expanding to Afaan Oromo and Tigrinya. A landmark for
            African language AI.
          </div>
          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            View on HuggingFace
          </div>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 shrink-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800 pt-4 sm:pt-0">
          <div>
            <div className="text-xl sm:text-[26px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight leading-none text-right">1.2k</div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 text-right">downloads/mo</div>
          </div>
          <div>
            <div className="text-base sm:text-lg text-emerald-600 dark:text-emerald-400 leading-none text-right font-semibold">AM</div>
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 text-right">primary lang</div>
          </div>
        </div>
      </div>
    </div>
  );
}
