"use client";

import { FaWhatsapp } from "react-icons/fa";
import {
  HiOutlineClipboard,
  HiOutlineLink,
  HiOutlineShare,
} from "react-icons/hi2";
import { RiTelegramFill, RiTwitterXFill } from "react-icons/ri";
import { toast } from "sonner";

import { FRONTEND_URL } from "@/config/config";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { copyText } from "@/shared/lib/copy-to-clipboard";
import { cn } from "@/shared/lib/utils";

interface ShareButtonProps {
  path: string;
  title: string;
  text?: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
}

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = FRONTEND_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function shorten(text: string, max = 400): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function ShareButton({
  path,
  title,
  text,
  label = "Share",
  size = "sm",
  variant = "outline",
  className,
}: ShareButtonProps) {
  const url = absoluteUrl(path);
  const caption = shorten(text ?? title);
  const captionIncludesUrl = caption.includes(url);
  const shareCaption = caption.replace(url, "").trim() || shorten(title);
  const copyCaptionText = captionIncludesUrl ? caption : `${caption}\n${url}`;

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const shareTelegram = () => {
    open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareCaption)}`
    );
  };

  const shareX = () => {
    open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareCaption)}`
    );
  };

  const shareWhatsApp = () => {
    open(
      `https://wa.me/?text=${encodeURIComponent(`${shareCaption}\n${url}`)}`
    );
  };

  const copyLink = async () => {
    const ok = await copyText(url);
    if (ok) toast.success("Link copied");
    else toast.error("Could not copy the link");
  };

  const copyCaption = async () => {
    const ok = await copyText(copyCaptionText);
    if (ok) toast.success("Caption copied — ready to paste");
    else toast.error("Could not copy the caption");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={size}
          variant={variant}
          className={cn("gap-1.5", className)}
          aria-label={`Share ${title}`}
        >
          <HiOutlineShare className="size-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onSelect={shareTelegram}>
          <RiTelegramFill className="size-4 text-[#229ED9]" />
          Share on Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareX}>
          <RiTwitterXFill className="size-4" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={shareWhatsApp}>
          <FaWhatsapp className="size-4 text-[#25D366]" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={copyLink}>
          <HiOutlineLink className="size-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copyCaption}>
          <HiOutlineClipboard className="size-4" />
          Copy caption + link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
