import type { Metadata } from "next";
import Link from "next/link";
import { HiOutlineStar } from "react-icons/hi2";

import { FRONTEND_URL } from "@/config/config";
import CreatorPostCard from "@/features/creators/components/creator-post-card.component";
import { getCreatorKit } from "@/features/creators/lib/creator-kit.server";
import CopyButton from "@/shared/components/share/copy-button.component";
import ShareButton from "@/shared/components/share/share-button.component";
import { Button } from "@/shared/components/ui/button";
import { asset } from "@/shared/lib/asset";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";

const CREATORS_URL = `${FRONTEND_URL.replace(/\/$/, "")}/creators`;
const CREATORS_DESCRIPTION =
  "Ready-to-post updates, verified stats and shareable links about the Ethiopian AI ecosystem. Built for Telegram channels, newsletters and researchers.";

export const metadata: Metadata = {
  title: "Creator kit — tell the story of Ethiopian AI",
  description: CREATORS_DESCRIPTION,
  alternates: { canonical: CREATORS_URL },
  openGraph: {
    title: "Creator kit — tell the story of Ethiopian AI",
    description: CREATORS_DESCRIPTION,
    url: CREATORS_URL,
    siteName: "goha",
    type: "website",
    images: [
      {
        url: `${FRONTEND_URL.replace(/\/$/, "")}/og.png`,
        width: 1200,
        height: 630,
        alt: "goha — Creator kit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator kit — tell the story of Ethiopian AI",
    description: CREATORS_DESCRIPTION,
    images: [`${FRONTEND_URL.replace(/\/$/, "")}/og.png`],
  },
};

export default function CreatorsPage() {
  const kit = getCreatorKit();

  return (
    <main>
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-14 max-w-xl">
          <p className="mb-3 font-medium text-black/40 text-xs uppercase tracking-[0.08em]">
            Creator kit
          </p>
          <h1
            className="text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Ready to post
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Drafts generated from the open Ethiopian AI index. Copy one, add
            your voice, publish.
          </p>
        </header>

        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-muted-foreground text-sm leading-relaxed">
            {kit.oneLiner}
          </p>
          <div className="flex shrink-0 gap-2">
            <CopyButton text={kit.oneLiner} label="Copy" />
            <ShareButton
              path="/"
              title="goha — The home of Ethiopian AI"
              text={kit.oneLiner}
              label="Share"
            />
          </div>
        </div>

        <section aria-labelledby="posts-heading" className="mb-16">
          <h2 id="posts-heading" className="sr-only">
            Ready-to-post drafts
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {kit.posts.map((post) => (
              <CreatorPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section aria-labelledby="links-heading" className="mb-14">
          <h2
            id="links-heading"
            className="mb-4 font-medium text-primary text-sm tracking-tight"
          >
            More angles
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {kit.links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-primary"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="assets-heading" className="mb-14">
          <h2
            id="assets-heading"
            className="mb-4 font-medium text-primary text-sm tracking-tight"
          >
            Assets
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {[
              { label: "Social card", href: asset("/og.png") },
              { label: "Logo", href: asset("/goha-logo.svg") },
              { label: "Icon", href: asset("/icon-512.png") },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                download
                className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <div className="mb-20 flex flex-col gap-5 border-muted-black-stroke border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-muted-foreground text-sm leading-relaxed">
            If this saves you time, a star helps more creators find it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="sm">
              <a
                href={EXTERNAL_LINKS.GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HiOutlineStar className="size-4" />
                Star on GitHub
              </a>
            </Button>
            <Link
              href="/contribute"
              className="text-muted-foreground text-xs underline underline-offset-4 transition-colors hover:text-primary"
            >
              Submit data →
            </Link>
            <Link
              href="/contribute?type=feedback#form-heading"
              className="text-muted-foreground text-xs underline underline-offset-4 transition-colors hover:text-primary"
            >
              Feedback →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
