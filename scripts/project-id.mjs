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
