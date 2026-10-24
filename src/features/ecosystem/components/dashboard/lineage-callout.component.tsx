import Link from "next/link";

/* Slim discovery band — the lineage page is the site's signature
   visualization, so it gets a permanent door on the landing page. */
export default function LineageCallout() {
  return (
    <Link
      href="/lineage"
      className="group flex flex-col gap-4 rounded-[18px] border border-muted-black-stroke bg-card px-6 py-5 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_32px_-14px_rgb(0_0_0/0.14)] md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-muted-black-stroke"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#171717"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <circle cx="5" cy="12" r="2.1" />
            <circle cx="19" cy="5.5" r="2.1" />
            <circle cx="19" cy="18.5" r="2.1" />
            <path d="M7 11.2 16.9 6.4M7 12.8l9.9 4.8" />
          </svg>
        </span>
        <div>
          <h2
            className="text-[15px] text-primary tracking-[-0.01em]"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Every model has ancestors
          </h2>
          <p className="mt-0.5 text-muted-foreground text-sm">
            Explore the family tree of Ethiopian AI — Llama, Whisper, w2v-BERT
            and the models that descend from them.
          </p>
        </div>
      </div>
      <span className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors group-hover:text-primary">
        Open the lineage →
      </span>
    </Link>
  );
}
