"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LegacyRedirect({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center px-6">
      <meta httpEquiv="refresh" content={`0;url=${href}`} />
      <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.08em]">
        Moved
      </p>
      <h1 className="mt-2 text-2xl text-primary tracking-[-0.03em]">
        This link has a new home
      </h1>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        The record was moved to a stable address. You should be redirected
        automatically.
      </p>
      <Link
        href={href}
        className="mt-5 rounded-full bg-primary px-4 py-2 text-primary-foreground text-sm"
      >
        Continue to {label}
      </Link>
    </main>
  );
}
