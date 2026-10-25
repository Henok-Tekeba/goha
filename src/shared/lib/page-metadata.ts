import type { Metadata } from "next";

import { FRONTEND_URL } from "@/config/config";

const BASE = FRONTEND_URL.replace(/\/$/, "");

/**
 * Per-route metadata. Every page gets its own og:title, og:url and
 * og:description instead of inheriting the homepage card.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  const url = `${BASE}${path === "/" ? "/" : path}`;
  const image = {
    url: `${BASE}/og.png`,
    width: 1200,
    height: 630,
    alt: `${title} — goha`,
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: "goha",
      locale: "en_US",
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
