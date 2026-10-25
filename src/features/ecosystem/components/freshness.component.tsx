"use client";

import { formatDistanceToNowStrict } from "date-fns";
import { useEffect, useState } from "react";

/* Renders only after mount — the relative time depends on the client
   clock and would mismatch the static HTML otherwise. */
export default function Freshness({ indexedAt }: { indexedAt: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-success"
      />
      <span className="text-muted-foreground">
        updated {formatDistanceToNowStrict(new Date(indexedAt))} ago
      </span>
    </span>
  );
}
