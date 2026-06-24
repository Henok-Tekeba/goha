import SubmitForm from "./SubmitForm";

const STEPS = [
  { n: "1", title: "You submit", body: "Fill out the form or open a GitHub PR." },
  { n: "2", title: "We verify", body: "We check the model/dataset is real and relevant." },
  { n: "3", title: "It goes live", body: "Appears on goha.et within 48 hours." },
];

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-[52px] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-[100]">
        <a href="/" className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 tracking-tight hover:opacity-70 transition-opacity">
          goha<span className="text-emerald-600 dark:text-emerald-400 not-italic">.et</span>
        </a>
      </nav>
      <div className="flex-1 flex justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-[600px]">
          <h1 className="text-[28px] sm:text-[2rem] font-medium tracking-[-0.03em] text-neutral-900 dark:text-neutral-100 mb-1.5">
            Help us keep Ethiopian AI visible.
          </h1>
          <p className="text-[15px] sm:text-base text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            Know a model, dataset, company, or paper we&rsquo;re missing? Add it. Every contribution makes the index more complete.
          </p>
          <a
            href="https://github.com/goha-et/goha"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-8 font-mono"
          >
            Prefer to contribute directly? Open a PR on GitHub
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
          <SubmitForm />
          <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800">
            <div className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4">
              How it works
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STEPS.map((s) => (
                <div key={s.n} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] font-medium text-white bg-emerald-600 dark:bg-emerald-500 dark:text-emerald-950 w-5 h-5 rounded-full inline-flex items-center justify-center">
                      {s.n}
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{s.title}</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
