/**
 * goha is a read-only static site, so "saved projects" are a browser-local
 * watchlist. They never leave the device and need no account.
 */
export const BOOKMARKS_STORAGE_KEY = "goha:bookmarks";
export const BOOKMARKS_CHANGED_EVENT = "goha:bookmarks-changed";
export const MAX_BOOKMARKS = 1000;

export function parseBookmarkIds(raw: string | null): string[] {
  if (!raw) return [];

  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];

    return [
      ...new Set(
        value.filter(
          (item): item is string =>
            typeof item === "string" && item.length > 0 && item.length <= 200
        )
      ),
    ].slice(0, MAX_BOOKMARKS);
  } catch {
    return [];
  }
}

export function toggleBookmarkId(ids: string[], id: string): string[] {
  if (!id) return ids;
  if (ids.includes(id)) return ids.filter((item) => item !== id);
  return [...ids, id].slice(0, MAX_BOOKMARKS);
}
