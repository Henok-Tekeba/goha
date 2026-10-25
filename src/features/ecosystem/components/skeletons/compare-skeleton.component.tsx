import { Skeleton } from "@/shared/components/ui/skeleton";

export default function CompareSkeleton() {
  return (
    <div
      className="mx-auto max-w-5xl px-6"
      role="status"
      aria-label="Loading model comparison"
    >
      <header className="mb-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-3/4 max-w-xl" />
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-full rounded-[12px]" />
        ))}
      </div>

      <div className="my-16 flex flex-col items-center gap-3">
        <Skeleton className="h-6 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
    </div>
  );
}
