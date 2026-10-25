import type { Metadata } from "next";
import Link from "next/link";
import { FRONTEND_URL } from "@/config/config";
import CreatorLinkCard from "@/features/creators/components/creator-link-card.component";
import CreatorPostCard from "@/features/creators/components/creator-post-card.component";
import { getCreatorKit } from "@/features/creators/lib/creator-kit.server";
import StarRepoCard from "@/shared/components/community/star-repo-card.component";
import CTAFooter from "@/shared/components/layout/cta-footer";
import CopyButton from "@/shared/components/share/copy-button.component";
import ShareButton from "@/shared/components/share/share-button.component";
import { asset } from "@/shared/lib/asset";

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
    <>
      <main>
        <div className="mx-auto max-w-5xl px-6">
          <header className="mb-10 max-w-3xl">
            <p className="mb-2 font-medium text-black/40 text-xs uppercase tracking-[0.08em]">
              Creator kit
            </p>
            <h1
              className="text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Tell the story of Ethiopian AI
            </h1>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Ready-to-post updates, numbers you can quote and links that
              preview well. Built for Telegram channels, newsletters,
              researchers and anyone covering the ecosystem. Everything here is
              derived from the same daily index as the site — no estimates, no
              made-up numbers.
            </p>
          </header>

          <section
            aria-labelledby="one-liner-heading"
            className="mb-10 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="one-liner-heading"
                className="text-lg text-primary tracking-[-0.03em] md:text-xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                The one-liner
              </h2>
              <span className="text-muted-foreground text-xs">
                For channel descriptions and intros
              </span>
            </div>
            <p className="mt-3 text-primary text-sm leading-relaxed">
              {kit.oneLiner}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton text={kit.oneLiner} label="Copy one-liner" />
              <ShareButton
                path="/"
                title="goha — The home of Ethiopian AI"
                text={kit.oneLiner}
                label="Share the index"
              />
            </div>
          </section>

          <section aria-labelledby="posts-heading" className="mb-12">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="posts-heading"
                className="text-lg text-primary tracking-[-0.03em] md:text-xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Ready-to-post drafts
              </h2>
              <span className="text-muted-foreground text-xs">
                Copy, paste, publish
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {kit.posts.map((post) => (
                <CreatorPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          <section aria-labelledby="links-heading" className="mb-12">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="links-heading"
                className="text-lg text-primary tracking-[-0.03em] md:text-xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Share a specific angle
              </h2>
              <span className="text-muted-foreground text-xs">
                Every page has a Telegram-ready preview
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {kit.links.map((link) => (
                <CreatorLinkCard key={link.id} link={link} />
              ))}
            </div>
          </section>

          <section aria-labelledby="use-heading" className="mb-12">
            <h2
              id="use-heading"
              className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              How to use this
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Post the weekly pulse",
                  detail:
                    "It already contains the current counts, the biggest mover and a link. Add your own commentary on top.",
                },
                {
                  title: "Quote the gap report",
                  detail:
                    "The empty language × task cells are the most actionable story in the ecosystem. Link the report so people can verify.",
                },
                {
                  title: "Credit the source",
                  detail:
                    "Link goha and, where possible, the original model, dataset or paper. The index is only as good as its sources.",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-muted-black-stroke bg-white px-4 py-4"
                >
                  <span className="font-medium text-black/30 text-xs tabular-nums">
                    0{index + 1}
                  </span>
                  <p className="mt-1 font-medium text-primary text-sm tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="assets-heading" className="mb-12">
            <h2
              id="assets-heading"
              className="mb-4 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Brand assets
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Social card",
                  detail: "1200 × 630 · PNG",
                  href: asset("/og.png"),
                },
                {
                  label: "Logo",
                  detail: "Vector · SVG",
                  href: asset("/goha-logo.svg"),
                },
                {
                  label: "Icon",
                  detail: "512 × 512 · PNG",
                  href: asset("/icon-512.png"),
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  download
                  className="rounded-[16px] border border-muted-black-stroke bg-white px-4 py-4 transition-colors hover:border-black/20"
                >
                  <p className="font-medium text-primary text-sm tracking-tight">
                    {item.label}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {item.detail}
                  </p>
                  <span className="mt-3 inline-flex text-primary text-xs underline underline-offset-4">
                    Download →
                  </span>
                </a>
              ))}
            </div>
          </section>

          <div className="mb-16 grid gap-4 md:grid-cols-2">
            <StarRepoCard />
            <div className="rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5">
              <h2
                className="text-[15px] text-primary tracking-[-0.01em]"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Found something missing?
              </h2>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                Creators see the ecosystem before the scrapers do. If you know a
                model, dataset, paper or org that should be here, submit it and
                we'll add it to the next build.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/contribute"
                  className="inline-flex text-primary text-sm underline underline-offset-4"
                >
                  Submit a data point →
                </Link>
                <Link
                  href="/contribute?type=feedback#form-heading"
                  className="inline-flex text-muted-foreground text-sm underline underline-offset-4 transition-colors hover:text-primary"
                >
                  Send feedback →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/king.png")}
        imageIllustrationMobile={asset("/illustrations/king-mobile.png")}
      />
    </>
  );
}
