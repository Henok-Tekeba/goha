import Link from "next/link";
import { FaDownload, FaStar } from "react-icons/fa6";
import { ProjectTypeIcon } from "@/shared/components/ui/project-type-icon";
import { cn } from "@/shared/lib/utils";
import { formatNumberShort } from "@/shared/lib/utils/format-number";

const LANGUAGE_SHORT: Record<string, string> = {
  Amharic: "Amharic",
  "Afaan Oromo": "Oromo",
  Tigrinya: "Tigrinya",
  "Ge'ez": "Ge'ez",
  Somali: "Somali",
  "Sidaamu Afoo": "Sidaama",
  Wolaytta: "Wolaytta",
  Hadiyya: "Hadiyya",
  Afaraf: "Afar",
  English: "English",
};

interface ProjectCardProps {
  projectId?: string;
  title: string;
  description?: string;
  repoUrl?: string | null;
  ownerName?: string | null;
  kindLabel?: string | null;
  taskLabel?: string | null;
  downloadsMonthly?: number | null;
  growth?: number | null;
  sparkline?: { points: number[] } | null;
  repositoryDetails?: {
    stars?: number | null;
    languages?: unknown;
    license?: string | null;
  } | null;
  isRepositoryLoading?: boolean;
  className?: string;
}

export default function ProjectCardComponent({
  projectId,
  title = "",
  description = "",
  repoUrl = "",
  ownerName = null,
  kindLabel = null,
  taskLabel = null,
  downloadsMonthly = 0,
  repositoryDetails = null,
  className,
}: ProjectCardProps) {
  const org = ownerName ?? (repoUrl ? extractOwner(repoUrl) : null);

  const languages: string[] = Array.isArray(repositoryDetails?.languages)
    ? (repositoryDetails?.languages as string[])
    : Object.keys(
        (repositoryDetails?.languages as Record<string, number>) ?? {}
      );
  const language = languages[0]
    ? (LANGUAGE_SHORT[languages[0]] ?? languages[0])
    : null;
  const license = repositoryDetails?.license ?? null;
  const stars = repositoryDetails?.stars ?? 0;
  const downloads = downloadsMonthly ?? 0;

  return (
    <Link
      href={`/projects/${projectId}`}
      className={cn("block h-full outline-none", className)}
    >
      <article className="flex h-full flex-col rounded-[18px] border border-muted-black-stroke bg-white px-5 pt-5 pb-4 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_10px_32px_-14px_rgb(0_0_0/0.14)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <header className="flex items-start gap-3">
          <span className="mt-px flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-muted-black-stroke text-primary">
            <ProjectTypeIcon kindLabel={kindLabel} taskLabel={taskLabel} />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="truncate font-medium text-[15px] text-primary leading-5 tracking-[-0.01em]"
              title={title}
            >
              {title}
            </h3>
            {org && (
              <p className="mt-0.5 truncate text-muted-foreground text-xs">
                {org}
              </p>
            )}
          </div>
        </header>

        {description && (
          <p className="mt-3 line-clamp-2 text-[13px] text-muted-foreground leading-[1.5]">
            {description}
          </p>
        )}

        <footer className="mt-auto flex items-center gap-3 pt-4 text-[11px] text-muted-foreground tabular-nums">
          {downloads > 0 && (
            <span className="flex items-center gap-1">
              <FaDownload className="size-2.5 text-muted-foreground" />
              <span className="font-medium text-primary">
                {formatNumberShort(downloads)}
              </span>
              /mo
            </span>
          )}
          {stars > 0 && (
            <span className="flex items-center gap-1">
              <FaStar className="size-2.5 text-muted-foreground" />
              <span className="font-medium text-primary">
                {formatNumberShort(stars)}
              </span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-2.5">
            {language && <span>{language}</span>}
            {license && (
              <span className="uppercase tracking-[0.04em]">
                {String(license).slice(0, 8)}
              </span>
            )}
          </span>
        </footer>
      </article>
    </Link>
  );
}

function extractOwner(repoUrl: string): string | null {
  const match = repoUrl
    .replace(/^[a-zA-Z]+:\/\/[^/]+\//, "")
    .replace(/^git@[^:]+:/, "")
    .split("/")[0];
  return match || null;
}
