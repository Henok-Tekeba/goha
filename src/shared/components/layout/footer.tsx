"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import FooterMinimal from "@/shared/components/layout/footer-minimal.component";
import { Separator } from "@/shared/components/ui/separator";
import { asset } from "@/shared/lib/asset";
import { EXTERNAL_LINKS } from "@/shared/lib/constants";

type FooterLink = {
  label: string;
  href: string;
  id: string;
  external?: boolean;
};

const footerLinks: {
  explore: FooterLink[];
  community: FooterLink[];
  legal: FooterLink[];
} = {
  explore: [
    {
      label: "Models",
      href: "/?categories=Model",
      id: "explore-models",
    },
    {
      label: "Datasets",
      href: "/?categories=Dataset",
      id: "explore-datasets",
    },
    {
      label: "Research",
      href: "/research",
      id: "explore-research",
    },
    {
      label: "Benchmarks",
      href: "/leaderboard",
      id: "explore-benchmarks",
    },
    {
      label: "Model lineage",
      href: "/lineage",
      id: "explore-lineage",
    },
    {
      label: "Compare models",
      href: "/compare",
      id: "explore-compare",
    },
    {
      label: "Ask Goha",
      href: "/ask",
      id: "explore-ask",
    },
    {
      label: "Gap report",
      href: "/gaps",
      id: "explore-gaps",
    },
    {
      label: "Languages",
      href: "/lang",
      id: "explore-languages",
    },
    {
      label: "Activity feed",
      href: "/activity",
      id: "explore-activity",
    },
    {
      label: "Organizations",
      href: "/orgs",
      id: "explore-orgs",
    },
  ],
  community: [
    {
      label: "GitHub",
      href: EXTERNAL_LINKS.GITHUB_REPO,
      external: true,
      id: "community-github",
    },
    {
      label: "Contribute data",
      href: `${EXTERNAL_LINKS.GITHUB_REPO}/issues/new`,
      external: true,
      id: "community-contribute",
    },
    {
      label: "About goha",
      href: "/about",
      id: "community-about",
    },
    {
      label: "Open data / API",
      href: "/api",
      id: "community-api",
    },
  ],
  legal: [
    {
      label: "Terms and Conditions",
      href: "/terms-and-conditions",
      id: "legal-terms",
    },
    {
      label: "Privacy Policy",
      href: "/privacy-policy",
      id: "legal-privacy",
    },
  ],
};

const renderLinkSection = (title: string, links: FooterLink[]) => (
  <div>
    <h2 className="mb-3 font-medium text-foreground text-sm md:mb-4 md:text-sm">
      {title}
    </h2>
    <ul className="space-y-3 text-muted-foreground text-sm md:text-sm">
      {links.map((link) => (
        <li key={link.id}>
          <Link
            className="transition hover:text-foreground"
            href={link.href}
            {...(link.external && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  const pathname = usePathname();
  const [is404Page, setIs404Page] = useState(false);

  useEffect(() => {
    const checkFor404 = () => {
      if (typeof window !== "undefined") {
        const h1Element = document.querySelector("main h1");
        const is404 =
          h1Element?.textContent?.trim() === "404" ||
          document.title.includes("404 - Page Not Found");
        setIs404Page(is404);
      }
    };
    checkFor404();
    requestAnimationFrame(checkFor404);
  }, []);

  const isProfileEditPage = pathname === "/profile/me/edit";

  const showShortFooter = isProfileEditPage;

  const hideFooter =
    is404Page ||
    pathname.startsWith("/projects/create") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/not-found") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/onboarding") ||
    isProfileEditPage;

  return (
    <>
      {showShortFooter && (
        <div className="mx-4 mb-8 max-w-6xl md:mx-auto">
          <FooterMinimal className="relative z-20 block w-full bg-white" />
        </div>
      )}
      {!hideFooter && (
        <footer className="mx-4 mb-8 max-w-6xl bg-white md:mx-auto">
          <Separator className="mx-auto mb-8 w-11/12 lg:w-full" />
          <div className="flex w-full flex-col items-start gap-10 max-md:pl-3 md:flex-row md:items-start md:justify-between md:gap-12 md:pl-0">
            {/* Left: Logo + copyright */}
            <div className="flex w-full flex-col items-start gap-4 md:w-auto">
              <Link
                href="/"
                className="flex items-center transition-opacity duration-200 hover:opacity-50"
              >
                <Image
                  src={asset("/goha-logo.svg")}
                  alt="goha logo"
                  width={126}
                  height={30}
                />
              </Link>
              <span className="text-muted-foreground text-sm">
                © goha • 2026
              </span>
              <span className="max-w-[280px] text-muted-foreground text-xs leading-relaxed">
                UI adapted from{" "}
                <a
                  className="underline underline-offset-4 transition hover:text-foreground"
                  href="https://opensource-together.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenSource Together
                </a>{" "}
                (CC BY-NC 4.0)
              </span>
            </div>

            {/* Right: Link sections */}
            <div className="grid w-full grid-cols-1 gap-y-8 md:w-auto md:grid-cols-3 md:gap-14 md:text-sm">
              {renderLinkSection("Explore", footerLinks.explore)}
              {renderLinkSection("Community", footerLinks.community)}
              {renderLinkSection("Legal", footerLinks.legal)}
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
