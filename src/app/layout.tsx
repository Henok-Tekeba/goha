import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

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

const metadataImageUrl = `${FRONTEND_URL}/illustrations/ost-metadata.png`;

export const metadata: Metadata = {
  metadataBase: new URL(FRONTEND_URL),
  title: {
    default: "goha.et — The home of Ethiopian AI",
    template: "%s | goha.et",
  },
  description:
    "Find models, datasets, companies, and research papers for Ethiopian languages.",
  icons: {
    icon: "/favicon.ico",
  },
  authors: [{ name: "Henok Tekeba" }],
  creator: "goha.et",
  publisher: "goha.et",
  applicationName: "goha.et",
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
    title: "goha.et — The home of Ethiopian AI",
    description:
      "Find models, datasets, companies, and research papers for Ethiopian languages.",
    images: [
      {
        url: metadataImageUrl,
        width: 1200,
        height: 630,
        alt: "goha.et — Find and discover the Ethiopian AI ecosystem",
      },
    ],
    url: FRONTEND_URL,
    siteName: "goha.et",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "goha.et — The home of Ethiopian AI",
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
    "goha.et",
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
      <body suppressHydrationWarning>
        <Providers>
          <Header githubStars={githubStars} />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
