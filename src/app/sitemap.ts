import type { MetadataRoute } from "next";

import { FRONTEND_URL } from "@/config/config";
import { projects } from "@/shared/lib/local-data.server";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: FRONTEND_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${FRONTEND_URL}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${FRONTEND_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];

  /* goha.et: the committed data IS the source — no fetches at build. */
  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => project.id && project.published)
    .map((project) => ({
      url: `${FRONTEND_URL}/projects/${project.id}`,
      lastModified: project.updatedAt
        ? new Date(project.updatedAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...projectRoutes];
}
