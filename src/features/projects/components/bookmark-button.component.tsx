"use client";

import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { useLocalBookmarks } from "@/shared/hooks/use-local-bookmarks.hook";

interface BookmarkButtonProps {
  projectId: string;
}

export function BookmarkButton({ projectId }: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useLocalBookmarks();
  const saved = isBookmarked(projectId);

  const handleToggle = () => {
    const nowSaved = toggle(projectId);
    toast.success(
      nowSaved ? "Saved on this device" : "Removed from saved projects",
      {
        description: nowSaved
          ? "You can find it under Saved projects."
          : undefined,
      }
    );
  };

  return (
    <Button
      size="icon"
      variant="outline"
      className="size-9"
      onClick={handleToggle}
      aria-label={saved ? "Remove from saved projects" : "Save project"}
      title={saved ? "Remove from saved projects" : "Save on this device"}
    >
      {saved ? <HiBookmark className="text-primary" /> : <HiOutlineBookmark />}
    </Button>
  );
}
