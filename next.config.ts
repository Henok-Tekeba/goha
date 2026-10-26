import type { NextConfig } from "next";

/* GitHub Pages architecture: fully static export.
   NEXT_PUBLIC_BASE_PATH ("/goha") is set only in the Pages workflow. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  /* Production source maps are not shipped: they add a large download and
     expose internal module paths without helping visitors. */
  productionBrowserSourceMaps: false,
  basePath,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

module.exports = nextConfig;
