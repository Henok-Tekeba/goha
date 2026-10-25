import type { Metadata } from "next";
import LanguagePageView from "@/features/ecosystem/views/language-page.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import LegacyRedirect from "@/shared/components/legacy-redirect.component";
import { asset } from "@/shared/lib/asset";
import { getLanguagePage, languages } from "@/shared/lib/local-data.server";
import { pageMetadata } from "@/shared/lib/page-metadata";

type Props = {
  params: Promise<{ langSlug: string }>;
};

const LEGACY_LANGUAGE_SLUGS: Record<string, string> = {
  wolayttattoo: "wolaytta",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...languages.map((language) => ({ langSlug: language.slug })),
    ...Object.keys(LEGACY_LANGUAGE_SLUGS).map((langSlug) => ({ langSlug })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { langSlug } = await params;
  const legacyTarget = LEGACY_LANGUAGE_SLUGS[langSlug];
  if (legacyTarget) {
    return {
      title: "Language moved",
      description: "This language page has a stable new address.",
      alternates: { canonical: `/lang/${legacyTarget}` },
      robots: { index: false, follow: true },
    };
  }
  const language = languages.find((l) => l.slug === langSlug);
  if (!language)
    return {
      title: "Language",
      description: "Discover the Ethiopian AI ecosystem on goha.",
    };
  return pageMetadata({
    title: `${language.name} AI — models, datasets & research`,
    description: `Models, datasets and research papers indexed with ${language.name} in their language metadata, with a coverage map and the gaps still open.`,
    path: `/lang/${language.slug}`,
  });
}

export default async function LanguagePage({ params }: Props) {
  const { langSlug } = await params;
  const legacyTarget = LEGACY_LANGUAGE_SLUGS[langSlug];
  if (legacyTarget) {
    return (
      <LegacyRedirect
        href={`/lang/${legacyTarget}`}
        label="the current language page"
      />
    );
  }
  const data = getLanguagePage(langSlug);
  if (!data) return null;

  return (
    <>
      <main>
        <LanguagePageView data={data} />
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
