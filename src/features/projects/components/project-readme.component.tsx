"use client";

import ReactMarkdown, { type Components } from "react-markdown";

import { readmeFullMarkdownComponents } from "@/shared/components/ui/markdown-components";
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "@/shared/lib/markdown";

interface ProjectReadmeProps {
  readme: string;
  projectTitle: string;
  project: {
    repoUrl: string | null;
  };
}

function resolveReadmeImageUrl(
  src: string | undefined,
  repoUrl: string | null
): string | undefined {
  if (!src) return src;
  // Keep absolute and data URIs as-is
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) return src;

  if (!repoUrl) return src;

  let owner = "";
  let repo = "";
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname
      .replace(/\.git$/i, "")
      .split("/")
      .filter(Boolean);
    // pathname: /owner/repo
    owner = parts[0] ?? "";
    repo = parts[1] ?? "";

    // Normalize src (remove leading ./)
    const normalized = src.replace(/^\.\//, "").replace(/^\//, "");

    if (/github\.com$/i.test(url.hostname)) {
      // https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{path}
      return `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${normalized}`;
    }
    if (/gitlab\.com$/i.test(url.hostname)) {
      // https://gitlab.com/{owner}/{repo}/-/raw/HEAD/{path}
      return `${url.origin}/${owner}/${repo}/-/raw/HEAD/${normalized}`;
    }
    return src;
  } catch {
    return src;
  }
}

export default function ProjectReadme({ readme, project }: ProjectReadmeProps) {
  const components: Components = {
    ...(readmeFullMarkdownComponents as unknown as Components),
    img: ({ src, alt, width, height }) => (
      // biome-ignore lint/performance/noImgElement: required for markdown images
      <img
        src={resolveReadmeImageUrl(
          typeof src === "string" ? src : undefined,
          project?.repoUrl
        )}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="my-3 inline-block h-auto max-w-full rounded border-border"
      />
    ),
    picture: ({ children }) => (
      <picture className="my-3 inline-block h-auto max-w-full rounded border-border">
        {children}
      </picture>
    ),
    source: ({ srcSet, media, ...props }) => {
      const resolvedSrcSet = srcSet
        ? srcSet
            .split(",")
            .map((src) => {
              const parts = src.trim().split(/\s+/);
              const url = parts[0];
              const descriptor = parts.slice(1).join(" ");
              const resolvedUrl = resolveReadmeImageUrl(url, project?.repoUrl);
              return descriptor ? `${resolvedUrl} ${descriptor}` : resolvedUrl;
            })
            .join(", ")
        : undefined;

      return <source srcSet={resolvedSrcSet} media={media} {...props} />;
    },
  };

  return (
    <div className="max-w-none font-geist text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={components}
      >
        {readme}
      </ReactMarkdown>
    </div>
  );
}
