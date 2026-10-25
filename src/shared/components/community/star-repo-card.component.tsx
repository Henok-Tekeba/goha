import { HiOutlineStar } from "react-icons/hi2";
import { RiGithubFill } from "react-icons/ri";

import { Button } from "@/shared/components/ui/button";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

export default function StarRepoCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-muted-black-stroke bg-white px-5 py-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-muted-black-stroke">
          <RiGithubFill className="size-5" aria-hidden />
        </span>
        <div>
          <h2
            className="text-[15px] text-primary tracking-[-0.01em]"
            style={{ fontFamily: "Aspekta", fontWeight: 500 }}
          >
            Star the repo
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            If goha saves you time, a star helps more builders and creators find
            the index. It is the clearest signal that this should keep growing.
          </p>
        </div>
      </div>
      <Button asChild className="mt-4" size="sm">
        <a
          href={EXTERNAL_LINKS.GITHUB_REPO}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HiOutlineStar className="size-4" />
          Star goha on GitHub
        </a>
      </Button>
    </div>
  );
}
