import Link from "next/link";
import { FaArrowTrendUp } from "react-icons/fa6";

import { formatNumberShort } from "@/shared/lib/utils/format-number";
import type { InsightGainer } from "../types/ecosystem.types";

function MoverCard({ gainer }: { gainer: InsightGainer }) {
  const href = gainer.projectId
    ? `/projects/${gainer.projectId}`
    : `https://huggingface.co/${gainer.id}`;
  const isExternal = !gainer.projectId;

  return (
    <Link
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group flex min-w-0 flex-1 flex-col gap-2 rounded-[16px] border border-muted-black-stroke px-4 py-3.5 transition-shadow duration-300 hover:shadow-[0_4px_32px_-8px_rgb(0_0_0/0.06)]"
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success-strong text-xs tabular-nums"
          title="7-day download growth"
        >
          <FaArrowTrendUp className="size-3" />
          {gainer.growth > 0 ? `+${gainer.growth}%` : `${gainer.growth}%`}
        </span>
        <span className="ml-auto text-muted-foreground text-xs tabular-nums">
          {formatNumberShort(gainer.start)} → {formatNumberShort(gainer.end)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-primary text-sm tracking-tight">
          {gainer.name}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          by {gainer.org}
        </p>
      </div>
    </Link>
  );
}

export default function MoversSection({ movers }: { movers: InsightGainer[] }) {
  if (movers.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-labelledby="movers-heading"
    >
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="movers-heading"
          className="text-lg text-primary tracking-[-0.03em]"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Movers this week
        </h2>
        <Link
          href="/leaderboard"
          className="text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          Benchmarks & rankings →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {movers.map((gainer) => (
          <MoverCard key={gainer.id} gainer={gainer} />
        ))}
      </div>
    </section>
  );
}
