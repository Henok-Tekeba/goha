import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { FRONTEND_URL } from "@/config/config";

import Footer from "@/shared/components/layout/footer";
import Header from "@/shared/components/layout/header";
import { Toaster } from "@/shared/components/ui/sonner";
import { getGithubRepoStars } from "@/shared/lib/github-stars";

import "../../public/fonts/font-face.css";
import "./globals.css";
import { Providers } from "./providers";

/* Self-hosted variable fonts (same files the reference serves) — no
   Google Fonts network dependency at build time. OFL licensed. */
const geistSans = localFont({
  src: "../fonts/Geist-latin-var.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const GeistMono = localFont({
  src: "../fonts/GeistMono-latin-var.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const metadataImageUrl = `${FRONTEND_URL}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(FRONTEND_URL),
  title: {
    default: "goha — The home of Ethiopian AI",
    template: "%s | goha",
  },
  description:
    "Find models, datasets, companies, and research papers for Ethiopian languages.",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  authors: [{ name: "Henok Tekeba" }],
  creator: "goha",
  publisher: "goha",
  applicationName: "goha",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
  openGraph: {
    title: "goha — The home of Ethiopian AI",
    description:
      "Find models, datasets, companies, and research papers for Ethiopian languages.",
    images: [
      {
        url: metadataImageUrl,
        width: 1200,
        height: 630,
        alt: "goha — Find and discover the Ethiopian AI ecosystem",
      },
    ],
    url: FRONTEND_URL,
    siteName: "goha",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "goha — The home of Ethiopian AI",
    creator: "@HenokTekeba",
    images: [metadataImageUrl],
    description:
      "Find models, datasets, companies, and research papers for Ethiopian languages.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  keywords: [
    "goha",
    "Ethiopian AI",
    "Amharic AI",
    "Amharic models",
    "Amharic datasets",
    "Ethiopian languages",
    "Amharic NLP",
    "Tigrinya",
    "Afaan Oromo",
    "Ge'ez",
    "Ethiopia machine learning",
    "AI community Ethiopia",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const githubStars = await getGithubRepoStars();

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${geistSans.variable} ${GeistMono.variable} antialiased`}
    >
      {/* No manual Aspekta preload: the stylesheet already references Next's
          hashed copy of the font, so a /fonts/... preload downloaded the same
          22 KB file twice and competed with the hero image. */}
      <body suppressHydrationWarning>
        <Providers>
          <Header githubStars={githubStars} />
          {children}
          <Footer />
          <Toaster />
        </Providers>
        {process.env.NEXT_PUBLIC_GOATCOUNTER_CODE ? (
          <Script
            data-goatcounter={`https://${process.env.NEXT_PUBLIC_GOATCOUNTER_CODE}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
