import Link from "next/link";

import type { LanguageTile } from "../../types/ecosystem.types";

export default function LanguageTiles({
  languages,
}: {
  languages: LanguageTile[];
}) {
  return (
    <section aria-labelledby="languages-heading">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2
          id="languages-heading"
          className="text-lg text-primary tracking-[-0.03em] md:text-xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Browse by language
        </h2>
        <Link
          href="/lang"
          className="shrink-0 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
        >
          All languages →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {languages.map((language) => (
          <Link
            key={language.slug}
            href={`/lang/${language.slug}`}
            className="flex items-center gap-3 rounded-[16px] border border-muted-black-stroke bg-white px-4 py-3.5 transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_-14px_rgb(0_0_0/0.14)]"
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-muted-black-stroke text-base text-primary"
              style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
              aria-hidden
            >
              {language.glyph}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-[13px] text-primary">
                {language.name}
              </span>
              <span className="block text-[11px] text-muted-foreground tabular-nums">
                {language.total} assets
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
