import Image from "next/image";

interface StackLogoProps {
  icon: string;
  alt: string;
  name?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function StackLogo({
  icon,
  alt,
  name,
  width = 20,
  height = 20,
}: StackLogoProps) {
  let iconSrcToUse = icon;
  if (
    typeof icon === "string" &&
    !icon.startsWith("/") &&
    !icon.includes("://") &&
    !icon.startsWith("data:")
  ) {
    iconSrcToUse = `/icons/${icon}`;
  }

  /* language glyph tiles are black line art — invert them on dark surfaces;
     devicon logos are already colored and stay as-is */
  const isGlyphTile =
    typeof iconSrcToUse === "string" && iconSrcToUse.includes("/langs/");

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-1">
        <Image
          src={iconSrcToUse}
          alt={alt}
          width={width}
          height={height}
          className={isGlyphTile ? "shrink-0 dark:invert" : "shrink-0"}
        />
        {name && (
          <span className="text-foreground/70 text-xs md:text-sm">{name}</span>
        )}
      </div>
    </div>
  );
}
