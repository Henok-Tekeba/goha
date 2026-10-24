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
      description: "Discover the Ethiopian AI ecosystem on goha.et.",
    };
  const orgUrl = `${FRONTEND_URL.replace(/\/$/, "")}/orgs/${org.slug}`;
  return {
    title: `${org.name} — Ethiopian AI organization · goha.et`,
    description:
      org.desc ??
      `${org.name} — ${kindWord(org.kind)} in the Ethiopian AI ecosystem on goha.et.`,
    alternates: { canonical: `/orgs/${org.slug}` },
    openGraph: {
      title: `${org.name} — Ethiopian AI organization`,
      description:
        org.desc ?? `${org.name} on goha.et — the home of Ethiopian AI.`,
      url: orgUrl,
      type: "profile",
      siteName: "goha.et",
    },
  };
}

function kindWord(kind: string): string {
  return kind === "company"
    ? "an AI company"
    : kind === "lab"
      ? "a research lab"
      : "an independent builder";
}

export default async function OrgPage({ params }: Props) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) return null;
  const projects = getOrgProjects(org);

  return (
    <>
      <main>
        <OrgDetailView org={org} projects={projects} />
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
