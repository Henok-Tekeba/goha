import { asset } from "@/shared/lib/asset";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "goha.et",
    short_name: "goha",
    description:
      "Find models, datasets, companies, and research papers for Ethiopian languages.",
    start_url: "/",
    lang: "en-US",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: asset("/favicon.ico"),
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: asset("/goha-logo.svg"),
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: asset("/goha-logo.svg"),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
