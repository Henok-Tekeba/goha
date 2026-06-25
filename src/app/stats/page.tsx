import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Stats — goha.et",
};

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 mb-8"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="text-center py-16">
          <h1 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Stats coming soon
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto">
            The stats page needs at least a week of daily snapshots to show meaningful charts. Check back after the scraper has been running for a few more days.
          </p>
        </div>
      </div>
    </div>
  );
}
