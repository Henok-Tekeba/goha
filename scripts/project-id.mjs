import { createHash } from "node:crypto";

/**
 * Stable project id derived only from the upstream source identity.
 * The same source id must always produce the same project id, regardless of
 * scrape order, pagination or which other records are present.
 */
export function projectIdForSource(sourceId) {
  const digest = createHash("sha256")
    .update(String(sourceId))
    .digest("hex")
    .slice(0, 32);
  return `pjt_${digest}`;
}

/**
 * Resolve Hugging Face renames/transfers through an explicit alias map,
 * for example {"hf:old-owner/name": "hf:new-owner/name"}.
 * Chains are followed; cycles are treated as terminal.
 */
export function resolveSourceAlias(sourceId, aliases) {
  let current = String(sourceId);
  const seen = new Set();

  while (aliases?.[current] && !seen.has(current)) {
    seen.add(current);
    current = String(aliases[current]);
  }

  return current;
}
