import Link from "next/link";

import ShareButton from "@/shared/components/share/share-button.component";

import type { CreatorLink } from "../lib/creator-kit.server";

export default function CreatorLinkCard({ link }: { link: CreatorLink }) {
  return (
    <div className="flex flex-col rounded-[16px] border border-muted-black-stroke bg-white px-4 py-4">
      <h3 className="font-medium text-primary text-sm tracking-tight">
        {link.label}
      </h3>
      <p className="mt-1 flex-1 text-muted-foreground text-xs leading-relaxed">
        {link.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={link.href}
          className="text-[12px] text-primary underline underline-offset-4"
        >
          Open →
        </Link>
        <ShareButton
          path={link.href}
          title={link.label}
          text={link.shareText}
          label="Share"
        />
      </div>
    </div>
  );
}
