"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "@/shared/lib/markdown";
import { learnMarkdownComponents } from "./markdown-components";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={markdownRemarkPlugins}
      rehypePlugins={markdownRehypePlugins}
      components={learnMarkdownComponents as unknown as Components}
    >
      {content}
    </ReactMarkdown>
  );
}
