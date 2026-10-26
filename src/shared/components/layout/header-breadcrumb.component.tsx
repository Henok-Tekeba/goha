"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChevronRight } from "react-icons/hi2";

import { useProjectQuery } from "@/features/projects/hooks/project.queries";

export default function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const projectIndex = segments.indexOf("projects");
  const publicProjectId =
    projectIndex !== -1 ? segments[projectIndex + 1] : undefined;

  const { data: publicProject } = useProjectQuery(publicProjectId ?? "");

  const breadcrumbItems =
    publicProjectId && pathname.startsWith("/projects/")
      ? [
          {
            label: publicProject?.title || "Project",
            href: pathname,
          },
        ]
      : [];

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="flex min-w-0 items-center space-x-1 overflow-hidden text-muted-foreground text-sm">
      {breadcrumbItems.map((item) => (
        <div key={item.href} className="flex min-w-0 items-center">
          <HiChevronRight size={12} className="mr-2 text-muted-foreground" />
          <Link
            href={item.href}
            className="max-w-56 truncate transition-colors hover:text-primary md:max-w-80"
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
