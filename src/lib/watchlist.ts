export interface WatchItem {
  id: string;
  type: "model" | "dataset";
  name: string;
  org: string;
  badge?: string;
  addedAt: string;
}

const STORAGE_KEY = "goha_watchlist";

function read(): WatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(items: WatchItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function getWatchlist(): WatchItem[] {
  return read();
}

export function addToWatchlist(item: WatchItem) {
  const items = read();
  if (!items.some((i) => i.id === item.id)) {
    items.push(item);
    write(items);
  }
}

export function removeFromWatchlist(id: string) {
  const items = read().filter((i) => i.id !== id);
  write(items);
}

export function isWatched(id: string): boolean {
  return read().some((i) => i.id === id);
}

export function toggleWatchlist(item: WatchItem): boolean {
  const items = read();
  const exists = items.findIndex((i) => i.id === item.id);
  if (exists >= 0) {
    items.splice(exists, 1);
    write(items);
    return false;
  } else {
    items.push(item);
    write(items);
    return true;
  }
}
