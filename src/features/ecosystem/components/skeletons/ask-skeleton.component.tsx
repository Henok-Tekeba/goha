import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AskSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl px-6"
      role="status"
      aria-label="Loading Ask Goha"
    >
      <header className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-xl" />
      </header>

      <Skeleton className="h-12 w-full rounded-full" />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-7 w-32 rounded-full" />
        ))}
      </div>

      <div className="mt-8 rounded-[16px] border border-muted-black-stroke px-5 py-5">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full max-w-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
