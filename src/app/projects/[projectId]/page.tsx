import type { Metadata } from "next";
import { Suspense } from "react";
import { FRONTEND_URL } from "@/config/config";
import { getProject } from "@/features/projects/services/project.service";
import ProjectDetailView from "@/features/projects/views/project-detail.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import LegacyRedirect from "@/shared/components/legacy-redirect.component";
import { asset } from "@/shared/lib/asset";
import { legacyProjectIds, projects } from "@/shared/lib/local-data.server";

type Props = {
  params: Promise<{ projectId: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  const current = projects
    .filter((p) => p.id)
    .map((p) => ({ projectId: p.id as string }));
  const legacy = Object.keys(legacyProjectIds).map((projectId) => ({
    projectId,
  }));
  return [...current, ...legacy];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const legacyTarget = legacyProjectIds[projectId];
  if (legacyTarget) {
    return {
      title: "Project moved",
      description: "This goha project has a stable new address.",
      alternates: { canonical: `/projects/${legacyTarget}` },
      robots: { index: false, follow: true },
    };
  }
  try {
    const project = await getProject(projectId);

    const projectUrl = `${FRONTEND_URL.replace(/\/$/, "")}/projects/${projectId}`;

    return {
      title: `${project.title}`,
      description: project.description,
      alternates: { canonical: projectUrl },
      openGraph: {
        title: `${project.title}`,
        description: project.description,
        images: [
          {
            url: `${FRONTEND_URL.replace(/\/$/, "")}/og.png`,
            width: 1200,
            height: 630,
            alt: `${project.title} — goha`,
          },
        ],
        url: projectUrl,
        type: "website",
        siteName: "goha",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${project.title}`,
        description: project.description,
        images: [`${FRONTEND_URL.replace(/\/$/, "")}/og.png`],
      },
    };
  } catch (error) {
    console.error("generateMetadata project fetch failed:", error);
    return {
      title: "Project",
      description: "Discover the Ethiopian AI ecosystem on goha.",
    };
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{
    projectId: string;
  }>;
}) {
  const { projectId } = await params;
  const legacyTarget = legacyProjectIds[projectId];

  if (legacyTarget) {
    return (
      <LegacyRedirect
        href={`/projects/${legacyTarget}`}
        label="the current project page"
      />
    );
  }

  return (
    <>
      <Suspense>
        <ProjectDetailView projectId={projectId} />
      </Suspense>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
