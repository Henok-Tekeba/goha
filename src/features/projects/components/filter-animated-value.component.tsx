"use client";

import { cn } from "@/shared/lib/utils";

interface FilterAnimatedValueProps {
  value: string;
  className?: string;
}

/**
 * Swaps the filter chip label with a small CSS entrance. The keyed span
 * remounts when the value changes, so no animation library is needed for what
 * is effectively a one-shot transition.
 */
export function FilterAnimatedValue({
  value,
  className,
}: FilterAnimatedValueProps) {
  return (
    <div className="relative min-h-[20px] min-w-0">
      <span
        key={value}
        className={cn("filter-value-in block truncate", className)}
      >
        {value}
      </span>
    </div>
  );
}
