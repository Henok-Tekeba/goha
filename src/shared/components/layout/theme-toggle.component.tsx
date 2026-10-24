"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export default function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* the resolved theme is client-only — render a neutral placeholder
     until mount so hydration stays clean */
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-hidden
        className={cn("opacity-0", className)}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={className}
    >
      {isDark ? (
        <HiOutlineSun className="size-4" />
      ) : (
        <HiOutlineMoon className="size-4" />
      )}
    </Button>
  );
}
