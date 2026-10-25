"use client";

import { useState } from "react";
import { HiMiniCheck } from "react-icons/hi2";
import { LuCopy } from "react-icons/lu";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { copyText } from "@/shared/lib/copy-to-clipboard";
import { cn } from "@/shared/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  iconOnly?: boolean;
}

export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
  variant = "outline",
  className,
  iconOnly = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(text);
    if (!ok) {
      toast.error("Could not copy");
      return;
    }
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn(iconOnly && "size-8 px-0", className)}
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <HiMiniCheck className="size-4" />
      ) : (
        <LuCopy className="size-4" />
      )}
      {!iconOnly && (copied ? copiedLabel : label)}
    </Button>
  );
}
