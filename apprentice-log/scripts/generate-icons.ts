/**
 * Generate all required PWA/Android icons for Play Store release
 * Run with: npx tsx scripts/generate-icons.ts
 */

import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const ICON_SIZES = [48, 72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];
const OUTPUT_DIR = join(process.cwd(), "public", "icons");

// SVG icon content - clipboard icon with blue gradient background
const createIconSvg = (size: number, maskable: boolean = false) => {
  const padding = maskable ? size * 0.1 : 0; // 10% safe zone for maskable
  const iconSize = size - padding * 2;
  const strokeWidth = size < 100 ? 2.5 : size < 200 ? 2 : 1.5;
  const borderRadius = maskable ? size * 0.2 : size * 0.15;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="url(#bg)"/>
  <g transform="translate(${size / 2 - iconSize * 0.4}, ${size / 2 - iconSize * 0.4})">
    <svg width="${iconSize * 0.8}" height="${iconSize * 0.8}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 12h6"/>
      <path d="M9 16h6"/>
    </svg>
  </g>
</svg>`;
};

async function generateIcons() {
  console.log("Creating output directory...");
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Generate standard icons
  console.log("\nGenerating standard icons:");
  for (const size of ICON_SIZES) {
    const svg = createIconSvg(size, false);
    const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with safe zone padding)
  console.log("\nGenerating maskable icons:");
  for (const size of MASKABLE_SIZES) {
    const svg = createIconSvg(size, true);
    const outputPath = join(OUTPUT_DIR, `maskable-${size}x${size}.png`);

    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    console.log(`  ✓ maskable-${size}x${size}.png`);
  }

  // Generate Play Store icon (512x512 high quality)
  console.log("\nGenerating Play Store icon:");
  const playStoreSvg = createIconSvg(512, false);
  await sharp(Buffer.from(playStoreSvg)).png({ quality: 100 }).toFile(join(OUTPUT_DIR, "play-store-icon.png"));
  console.log("  ✓ play-store-icon.png");

  // Generate feature graphic placeholder (1024x500)
  console.log("\nGenerating feature graphic placeholder:");
  const featureGraphicSvg = `
<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fgBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#fgBg)"/>
  <g transform="translate(80, 150)">
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 12h6"/>
      <path d="M9 16h6"/>
    </svg>
  </g>
  <text x="240" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="white">Apprentice Log</text>
  <text x="240" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#94a3b8">Voice-to-logbook for BCITO apprentices</text>
  <text x="240" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#64748b">Speak your work, we write it up</text>
</svg>`;

  await mkdir(join(process.cwd(), "public", "store-assets"), { recursive: true });
  await sharp(Buffer.from(featureGraphicSvg)).png().toFile(join(process.cwd(), "public", "store-assets", "feature-graphic.png"));
  console.log("  ✓ store-assets/feature-graphic.png");

  console.log("\n✅ All icons generated successfully!");
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
