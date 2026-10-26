import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/**
 * Markdown shown on goha comes from third parties: arXiv abstracts, Hugging
 * Face cards, GitHub READMEs and repository descriptions. Parsing raw HTML is
 * useful for tables, badges and <details> blocks, but the result must never be
 * trusted as executable markup.
 *
 * `rehype-raw` turns the HTML into HAST nodes; `rehype-sanitize` then applies
 * the GitHub-style allowlist (no scripts, iframes, forms, style/meta/base,
 * event handlers, or active URL schemes) before React renders the tree.
 *
 * Keep every `ReactMarkdown` instance on these plugin lists so a future source
 * of markdown cannot opt out of sanitisation by accident.
 */
export const markdownRemarkPlugins = [remarkGfm];

export const markdownRehypePlugins = [rehypeRaw, rehypeSanitize];
