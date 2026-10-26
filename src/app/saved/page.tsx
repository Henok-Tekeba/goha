import type { Metadata } from "next";

import SavedProjectsView from "@/features/projects/views/saved-projects.view";

export const metadata: Metadata = {
  title: "Saved projects",
  description:
    "Projects you saved on this device. The goha watchlist stays in your browser.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function SavedProjectsPage() {
  return <SavedProjectsView />;
}
