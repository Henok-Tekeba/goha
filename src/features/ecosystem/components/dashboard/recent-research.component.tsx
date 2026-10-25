import Image from "next/image";
import Link from "next/link";
import { asset } from "@/shared/lib/asset";

import type { PaperRecord } from "../../types/ecosystem.types";

export default function RecentResearch({ papers }: { papers: PaperRecord[] }) {
  return (
    <section aria-labelledby="recent-research-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="recent-research-heading"
          className="text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Latest research
        </h2>
        <Link
          href="/research"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          All research →
        </Link>
      </div>

      <ul className="rounded-[16px] border border-muted-black-stroke bg-white">
        {papers.map((paper) => (
          <li
            key={paper.slug}
            className="border-muted-black-stroke border-b last:border-b-0"
          >
            <Link
              href={
                paper.projectId
                  ? `/projects/${paper.projectId}`
                  : (paper.url ?? "/research")
              }
              className="flex items-baseline gap-3 px-5 py-3 transition-colors hover:bg-secondary/60"
            >
              <Image
                src={asset("/types/research.svg")}
                alt=""
                width={16}
                height={16}
                className="mt-0.5 shrink-0 opacity-60"
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-primary">
                {paper.title}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {[paper.languages[0], paper.year].filter(Boolean).join(" · ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
