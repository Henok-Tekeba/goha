import type { Metadata } from "next";
import LaunchFilmView from "@/features/launch-film/launch-film.view";
import { pageMetadata } from "@/shared/lib/page-metadata";

/**
 * The 15-second launch film. A self-contained, screen-recordable experience —
 * noindex so it stays out of search results.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "Launch film",
    description:
      "Making Ethiopian AI legible — a 15-second launch film for goha, the Ethiopian AI index.",
    path: "/launch-film",
  }),
  robots: { index: false, follow: false },
};

export default function LaunchFilmPage() {
  return <LaunchFilmView />;
}
