/**
 * Generate placeholder screenshots for Play Store
 * Run with: npx tsx scripts/generate-screenshots.ts
 *
 * NOTE: Replace these placeholders with actual app screenshots before submission!
 */

import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join } from "path";

const OUTPUT_DIR = join(process.cwd(), "public", "screenshots");

const createScreenshotSvg = (title: string, subtitle: string, screenNum: number) => {
  const colors = ["#3b82f6", "#2563eb"];
  const bgColor = colors[screenNum % colors.length];

  return `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screenBg${screenNum}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e3a8a;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1920" fill="url(#screenBg${screenNum})"/>

  <!-- Phone mockup frame -->
  <rect x="90" y="200" width="900" height="1520" rx="40" fill="#0a0a0a" stroke="#1f2937" stroke-width="4"/>

  <!-- Status bar area -->
  <rect x="90" y="200" width="900" height="60" rx="40" ry="0" fill="#111827"/>

  <!-- App content area -->
  <rect x="110" y="280" width="860" height="1420" fill="#0a0a0a"/>

  <!-- App header -->
  <rect x="110" y="280" width="860" height="80" fill="#111827"/>
  <text x="540" y="332" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="white" text-anchor="middle">Apprentice Log</text>

  <!-- Placeholder content -->
  <rect x="150" y="400" width="780" height="200" rx="16" fill="#1f2937"/>
  <rect x="150" y="640" width="780" height="160" rx="16" fill="#1f2937"/>
  <rect x="150" y="840" width="780" height="160" rx="16" fill="#1f2937"/>

  <!-- Title and subtitle -->
  <text x="540" y="1800" font-family="system-ui, sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">${title}</text>
  <text x="540" y="1860" font-family="system-ui, sans-serif" font-size="28" fill="#94a3b8" text-anchor="middle">${subtitle}</text>

  <!-- Placeholder notice -->
  <text x="540" y="700" font-family="system-ui, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">PLACEHOLDER</text>
  <text x="540" y="740" font-family="system-ui, sans-serif" font-size="20" fill="#4b5563" text-anchor="middle">Replace with actual screenshot</text>
</svg>`;
};

async function generateScreenshots() {
  console.log("Creating screenshots directory...");
  await mkdir(OUTPUT_DIR, { recursive: true });

  const screenshots = [
    { title: "Voice Recording", subtitle: "Speak your work, we write it up" },
    { title: "Entry History", subtitle: "View and manage all your entries" },
    { title: "Detailed Entries", subtitle: "Track tasks, tools, and skills" },
  ];

  console.log("\nGenerating placeholder screenshots:");
  for (let i = 0; i < screenshots.length; i++) {
    const { title, subtitle } = screenshots[i];
    const svg = createScreenshotSvg(title, subtitle, i);
    const outputPath = join(OUTPUT_DIR, `screenshot-${i + 1}.png`);

    await sharp(Buffer.from(svg)).png().toFile(outputPath);
    console.log(`  ✓ screenshot-${i + 1}.png - "${title}"`);
  }

  console.log("\n⚠️  IMPORTANT: These are placeholder screenshots!");
  console.log("   Replace them with actual app screenshots before Play Store submission.");
  console.log(`\n   Output directory: ${OUTPUT_DIR}`);
}

generateScreenshots().catch(console.error);
