import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { HiLogout } from "react-icons/hi";
import {
  HiBookOpen,
  HiCog6Tooth,
  HiMiniBars3,
  HiMiniPencilSquare,
  HiMiniSquare2Stack,
  HiOutlineBolt,
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineLanguage,
  HiOutlineMegaphone,
  HiOutlineShare,
  HiOutlineSparkles,
  HiPlus,
  HiStar,
  HiUserCircle,
} from "react-icons/hi2";
import { RiGithubFill, RiLoader2Fill } from "react-icons/ri";
import { toast } from "sonner";
import { useLogoutMutation } from "@/features/auth/hooks/auth.mutations";
import { useCurrentUserQuery } from "@/features/auth/hooks/auth.queries";
import SearchCommand from "@/features/projects/components/search-command.component";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { asset } from "@/shared/lib/asset";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";
import { getErrorMessage } from "@/shared/lib/get-error-message";
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
  { label: "Organizations", icon: HiOutlineBuildingOffice2, href: "/orgs" },
  { label: "Activity", icon: HiOutlineBolt, href: "/activity" },
  { label: "Creator kit", icon: HiOutlineMegaphone, href: "/creators" },
];

export function MobileHeader({ links, githubStars }: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUserQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const currentUser = currentUserQuery.data;
  const isAuthenticated = !!currentUser;
  const isLoading = currentUserQuery.isLoading;
  const [isOpen, setIsOpen] = useState(false);
  const resolvedLinks = links ?? DEFAULT_LINKS;

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsOpen(false);
      router.push("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign out"));
    }
  };

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

                {/* User Section - Fixed at bottom */}
                <div className="mt-auto">
                  {isLoading ? null : isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="relative flex w-full cursor-pointer items-center gap-3 py-4 text-start"
                        >
                          <div className="pl-4">
                            <Avatar
                              src={currentUser?.image}
                              name={currentUser?.name}
                              alt={currentUser?.name}
                              size="md"
                            />
                          </div>
                          <div className="flex flex-col truncate">
                            <p className="mr-10 truncate font-medium text-black text-sm">
                              {currentUser?.name}
                            </p>
                            <p className="mr-10 truncate text-muted-foreground text-xs">
                              {currentUser?.email}
                            </p>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="center"
                        className="w-[252px] min-w-[252px] max-w-[252px] text-muted-foreground"
                      >
                        <Link href="/profile/me" onClick={handleLinkClick}>
                          <DropdownMenuItem>
                            <HiUserCircle className="size-4" />
                            View profile
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/profile/me/edit" onClick={handleLinkClick}>
                          <DropdownMenuItem>
                            <HiMiniPencilSquare className="size-4" />
                            Edit profile
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link
                          href="/dashboard/settings"
                          onClick={handleLinkClick}
                        >
                          <DropdownMenuItem>
                            <HiCog6Tooth className="size-4" />
                            Settings
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          onClick={() => void handleLogout()}
                          disabled={logoutMutation.isPending}
                          variant="destructive"
                        >
                          {logoutMutation.isPending ? (
                            <RiLoader2Fill className="size-4 animate-spin" />
                          ) : (
                            <HiLogout className="size-4" />
                          )}
                          {logoutMutation.isPending
                            ? "Signing out..."
                            : "Sign out"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
