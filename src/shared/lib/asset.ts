/**
 * Resolves public/ asset paths against the deployment base path.
 * Next.js auto-prefixes _next assets and <Link> hrefs, but NOT
 * public/ files referenced manually — this helper covers those.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return path.startsWith("/") ? `${BASE}${path}` : `${BASE}/${path}`;
}
