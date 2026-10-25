import type { Metadata } from "next";
import LanguagePageView from "@/features/ecosystem/views/language-page.view";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { getLanguagePage, languages } from "@/shared/lib/local-data.server";

type Props = {
  params: Promise<{ langSlug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return languages.map((language) => ({ langSlug: language.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { langSlug } = await params;
  const language = languages.find((l) => l.slug === langSlug);
  if (!language)
    return {
      title: "Language",
      description: "Discover the Ethiopian AI ecosystem on goha.",
    };
  return {
    title: `${language.name} AI — models, datasets & research`,
    description: `Everything indexed for ${language.name}: models, datasets and research papers, with a coverage map and the gaps still open.`,
    alternates: { canonical: `/lang/${language.slug}` },
  };
}

export default async function LanguagePage({ params }: Props) {
  const { langSlug } = await params;
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
