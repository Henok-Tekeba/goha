"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  BOOKMARKS_CHANGED_EVENT,
  BOOKMARKS_STORAGE_KEY,
  parseBookmarkIds,
  toggleBookmarkId,
} from "@/shared/lib/bookmarks";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseBookmarkIds(window.localStorage.getItem(BOOKMARKS_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeToStorage(ids: string[]): void {
  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* Private mode/quota can reject storage; the in-memory state still works. */
  }
}

export function useLocalBookmarks() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const idsRef = useRef<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const next = readFromStorage();
      idsRef.current = next;
      setIds(next);
    };

    sync();
    setReady(true);
    window.addEventListener("storage", sync);
    window.addEventListener(BOOKMARKS_CHANGED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(BOOKMARKS_CHANGED_EVENT, sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = toggleBookmarkId(idsRef.current, id);
    idsRef.current = next;
    setIds(next);
    writeToStorage(next);
    window.dispatchEvent(new Event(BOOKMARKS_CHANGED_EVENT));
    return next.includes(id);
  }, []);

  return {
    ids,
    ready,
    isBookmarked: (id: string) => ids.includes(id),
    toggle,
  };
}
