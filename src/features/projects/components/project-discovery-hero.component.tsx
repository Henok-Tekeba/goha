import { asset } from "@/shared/lib/asset";

import type { ProjectFilters } from "../types/project-filters.type";
import { DiscoveryHeroIntro } from "./discovery-hero-intro.component";

interface ProjectDiscoveryHeroProps {
  onFilterChange?: (filters: ProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: ProjectFilters;
}

/* Static export means next/image cannot resize or convert anything, so the
   hero illustration ships pre-generated AVIF/WebP variants instead of the
   251 KB PNG. A single <picture> lets the browser fetch only the crop it
   actually renders (mobile vs desktop) instead of both. */
const DESKTOP_SIZES =
  "(max-width: 767px) 0px, (max-width: 1441px) 100vw, 1441px";
const MOBILE_SIZES = "115vw";

const DESKTOP_SRCSET = {
  avif: `${asset("/illustrations/traveler-1441.avif")} 1441w, ${asset("/illustrations/traveler-2882.avif")} 2882w`,
  webp: `${asset("/illustrations/traveler-1441.webp")} 1441w, ${asset("/illustrations/traveler-2882.webp")} 2882w`,
};
const MOBILE_SRCSET = {
  avif: `${asset("/illustrations/traveler-mobile.avif")} 402w`,
  webp: `${asset("/illustrations/traveler-mobile.webp")} 402w`,
};

export default function ProjectDiscoveryHero({
  onFilterChange,
  isLoading,
  initialFilters,
}: ProjectDiscoveryHeroProps) {
  return (
    <div className="relative mx-auto w-full">
      {/* Rendered immediately — no JS fade gate, no duplicate mobile/desktop
          downloads. `media` picks the crop before the request is made. */}
      <picture>
        <source
          media="(max-width: 767px)"
          type="image/avif"
          srcSet={MOBILE_SRCSET.avif}
          sizes={MOBILE_SIZES}
        />
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet={MOBILE_SRCSET.webp}
          sizes={MOBILE_SIZES}
        />
        <source
          media="(max-width: 767px)"
          type="image/png"
          srcSet={asset("/illustrations/traveler-mobile.png")}
          sizes={MOBILE_SIZES}
        />
        <source
          type="image/avif"
          srcSet={DESKTOP_SRCSET.avif}
          sizes={DESKTOP_SIZES}
        />
        <source
          type="image/webp"
          srcSet={DESKTOP_SRCSET.webp}
          sizes={DESKTOP_SIZES}
        />
        <img
          src={asset("/illustrations/traveler.png")}
          alt=""
          width={2882}
          height={800}
          fetchPriority="high"
          decoding="async"
          className="absolute bottom-10 left-1/2 z-[-1] aspect-[402/361] h-auto w-[115%] max-w-none -translate-x-1/2 object-contain sm:bottom-8 md:bottom-6 md:aspect-[2882/800] md:w-full md:max-w-[1441px] lg:bottom-3"
        />
      </picture>

      <div className="relative z-10 mx-auto mt-11 mb-5 flex min-h-[260px] w-full max-w-[1441px] flex-col items-center justify-center md:-mt-5 md:min-h-[320px] lg:min-h-[400px]">
        <DiscoveryHeroIntro
          onFilterChange={onFilterChange}
          isLoading={isLoading}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}
