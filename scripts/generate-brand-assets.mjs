#!/usr/bin/env node
/**
 * Generates the social share card and app icons from the goha mark.
 * Run: node scripts/generate-brand-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FONT =
  "ui-sans-serif, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

const mark = (scale, color = "#171717") => `
  <g transform="translate(0 0) scale(${scale})" fill="${color}">
    <circle cx="25" cy="22" r="13" />
    <rect x="7" y="38" width="36" height="2.5" rx="1.25" />
    <rect x="12" y="33" width="26" height="2.5" rx="1.25" fill="#a3a3a3" />
  </g>`;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff" />
  <rect x="0" y="0" width="1200" height="6" fill="#171717" />
  ${mark(2.2).replace('transform="translate(0 0) scale(2.2)"', 'transform="translate(96 120) scale(2.2)"')}
  <text x="96" y="380" font-family="${FONT}" font-size="132" font-weight="700" fill="#171717" letter-spacing="-4">goha</text>
  <text x="100" y="440" font-family="${FONT}" font-size="36" font-weight="500" fill="#404040">The home of Ethiopian AI</text>
  <text x="100" y="492" font-family="${FONT}" font-size="24" fill="#8a8a8a">Models · Datasets · Research · Benchmarks · Lineage</text>
  <text x="1104" y="580" text-anchor="end" font-family="${FONT}" font-size="22" fill="#a3a3a3">goha.enoch.et</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#ffffff" />
  <g transform="translate(108 108) scale(5.92)" fill="#171717">
    <circle cx="25" cy="22" r="13" />
    <rect x="7" y="38" width="36" height="2.5" rx="1.25" />
    <rect x="12" y="33" width="26" height="2.5" rx="1.25" fill="#a3a3a3" />
  </g>
</svg>`;

mkdirSync(path.join(ROOT, "public"), { recursive: true });

await sharp(Buffer.from(ogSvg))
  .png()
  .toFile(path.join(ROOT, "public", "og.png"));
await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .png()
  .toFile(path.join(ROOT, "public", "icon-512.png"));
await sharp(Buffer.from(iconSvg))
  .resize(192, 192)
  .png()
  .toFile(path.join(ROOT, "public", "icon-192.png"));
await sharp(Buffer.from(iconSvg))
  .resize(180, 180)
  .png()
  .toFile(path.join(ROOT, "public", "apple-touch-icon.png"));

/* Next.js app icon convention: src/app/icon.png becomes the favicon */
await sharp(Buffer.from(iconSvg))
  .resize(512, 512)
  .png()
  .toFile(path.join(ROOT, "src", "app", "icon.png"));

writeFileSync(
  path.join(ROOT, "public", "goha-og.svg"),
  ogSvg.replace(/\n\s*/g, " ").trim()
);

console.log(
  "✓ brand assets: public/og.png, icon-192/512, apple-touch-icon, src/app/icon.png"
);
