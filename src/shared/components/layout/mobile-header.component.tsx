import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  HiBookOpen,
  HiMiniBars3,
  HiMiniSquare2Stack,
  HiOutlineBolt,
  HiOutlineBookmark,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineLanguage,
  HiOutlineShare,
  HiOutlineSparkles,
  HiPlus,
  HiStar,
} from "react-icons/hi2";
import { RiGithubFill } from "react-icons/ri";
import SearchCommand from "@/features/projects/components/search-command.component";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { asset } from "@/shared/lib/asset";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

type MobileNavLink = {
  label: string;
  icon: React.ElementType;
  href: string;
};

interface MobileHeaderProps {
  links?: MobileNavLink[];
  githubStars?: number | null;
}

const DEFAULT_LINKS: MobileNavLink[] = [
  { label: "Models", icon: HiMiniSquare2Stack, href: "/?categories=Model" },
  { label: "Datasets", icon: HiBookOpen, href: "/?categories=Dataset" },
  { label: "Research", icon: HiOutlineDocumentText, href: "/research" },
  { label: "Benchmarks", icon: HiOutlineChartBar, href: "/leaderboard" },
  { label: "Lineage", icon: HiOutlineShare, href: "/lineage" },
  { label: "Ask Goha", icon: HiOutlineSparkles, href: "/ask" },
  { label: "Languages", icon: HiOutlineLanguage, href: "/lang" },
  { label: "Publishers", icon: HiOutlineBuildingOffice2, href: "/orgs" },
  { label: "Activity", icon: HiOutlineBolt, href: "/activity" },
  { label: "Saved", icon: HiOutlineBookmark, href: "/saved" },
];

export function MobileHeader({ links, githubStars }: MobileHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const resolvedLinks = links ?? DEFAULT_LINKS;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative sticky top-0 z-40 md:hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-2xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      <div className="relative z-10 flex items-center justify-between gap-2 px-4 py-[calc(var(--spacing)*4+8px)]">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity duration-200 ease-out hover:opacity-50"
        >
          <Image
            src={asset("/goha-logo.svg")}
            alt="goha"
            width={168}
            height={40}
          />
        </Link>

        <div className="flex items-center gap-4">
          <SearchCommand />

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <span className="sr-only">Open navigation</span>
                <HiMiniBars3 className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-3/4 flex-col rounded-tr-[22px] rounded-br-[22px] p-0 pt-6"
            >
              <SheetHeader className="flex flex-col gap-2 px-4">
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  aria-label="goha Home"
                  className="inline-block w-fit shrink-0"
                >
                  <Image
                    src={asset("/goha-logo.svg")}
                    alt="goha"
                    width={168}
                    height={40}
                  />
                </Link>
              </SheetHeader>

              <div className="flex flex-1 flex-col">
                <nav className="mt-6 flex flex-col gap-3 px-4">
                  <Link
                    href="/contribute"
                    onClick={handleLinkClick}
                    className="flex origin-center items-center gap-2 rounded-full bg-primary py-2 pl-4 font-medium text-primary-foreground text-sm transition hover:scale-[0.98]"
                  >
                    <HiPlus className="size-4" />
                    Submit a data point
                  </Link>
                  {resolvedLinks.map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-2 rounded-lg py-2 pl-2 font-medium text-sm transition hover:bg-accent ${
                          active
                            ? "bg-accent text-black"
                            : "text-muted-foreground"
                        }`}
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <a
                    href={EXTERNAL_LINKS.GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 rounded-lg py-2 pl-2 font-medium text-muted-foreground text-sm transition hover:bg-accent"
                  >
                    <RiGithubFill className="size-4" />
                    Star on GitHub
                    {githubStars != null && (
                      <span className="flex items-center gap-0.5 tabular-nums">
                        <HiStar className="size-3.5" />
                        {formatNumberShort(githubStars)}
                      </span>
                    )}
                  </a>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
