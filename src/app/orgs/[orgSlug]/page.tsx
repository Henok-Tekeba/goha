import type { Metadata } from "next";
import { FRONTEND_URL } from "@/config/config";
import OrgDetailView from "@/features/ecosystem/views/org-detail.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import {
  getOrgBySlug,
  getOrgProjects,
  orgs,
} from "@/shared/lib/local-data.server";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return orgs.map((org) => ({ orgSlug: org.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org)
    return {
      title: "Organization",
      description: "Discover the Ethiopian AI ecosystem on goha.",
    };
  const orgUrl = `${FRONTEND_URL.replace(/\/$/, "")}/orgs/${org.slug}`;
  return {
    title: `${org.name} — Ethiopian AI publisher`,
    description:
      org.desc ??
      `${org.name} — ${kindWord(org.kind)} in the Ethiopian AI ecosystem on goha.`,
    alternates: { canonical: `/orgs/${org.slug}` },
    openGraph: {
      title: `${org.name} — Ethiopian AI organization`,
      description:
        org.desc ?? `${org.name} on goha — an open index of Ethiopian AI.`,
      url: orgUrl,
      type: "profile",
      siteName: "goha",
    },
  };
}

function kindWord(kind: string): string {
  return kind === "company"
    ? "an AI company"
    : kind === "lab"
      ? "a research lab"
      : "an independent publisher";
}

export default async function OrgPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) return null;
  const projects = getOrgProjects(org);

  /* ecosystem max per axis — the reference for the footprint radar */
  const axes = (
    [
      { axis: "models", label: "Models", value: org.counts.models },
      { axis: "datasets", label: "Datasets", value: org.counts.datasets },
      { axis: "repos", label: "Repos", value: org.counts.repos },
      { axis: "spaces", label: "Spaces", value: org.counts.spaces },
    ] as const
  ).map(({ axis, label, value }) => ({
    axis,
    label,
    value,
    max: Math.max(1, ...orgs.map((o) => o.counts[axis] ?? 0)),
  }));

  return (
    <>
      <main>
        <OrgDetailView org={org} projects={projects} axes={axes} />
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
