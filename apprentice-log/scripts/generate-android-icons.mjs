import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Source logo
const logoPath = path.join(projectRoot, 'public', 'Logo-v1-256-256.png');

// Android icon sizes for adaptive icons
const mipmapSizes = {
  'mdpi': 48,
  'hdpi': 72,
  'xhdpi': 96,
  'xxhdpi': 144,
  'xxxhdpi': 192,
};

// Foreground icon is larger (108dp with safe zone)
const foregroundSizes = {
  'mdpi': 108,
  'hdpi': 162,
  'xhdpi': 216,
  'xxhdpi': 324,
  'xxxhdpi': 432,
};

// Splash icon sizes (centred icon on splash)
const splashIconSize = 288; // Logo size on splash

async function generateIcons() {
  console.log('🎨 Generating Android icons from:', logoPath);

  const androidResDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');

  // Check if source exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Source logo not found:', logoPath);
    process.exit(1);
  }

  // Generate mipmap icons
  for (const [density, size] of Object.entries(mipmapSizes)) {
    const mipmapDir = path.join(androidResDir, `mipmap-${density}`);

    if (!fs.existsSync(mipmapDir)) {
      fs.mkdirSync(mipmapDir, { recursive: true });
    }

    // ic_launcher.png - standard launcher icon
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(path.join(mipmapDir, 'ic_launcher.png'));

    console.log(`✅ Generated mipmap-${density}/ic_launcher.png (${size}x${size})`);

    // ic_launcher_round.png - round launcher icon
    const roundMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );

    await sharp(logoPath)
      .resize(size, size, { fit: 'cover' })
      .composite([{
        input: roundMask,
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(mipmapDir, 'ic_launcher_round.png'));

    console.log(`✅ Generated mipmap-${density}/ic_launcher_round.png (${size}x${size})`);
  }

  // Generate foreground icons (for adaptive icons)
  for (const [density, size] of Object.entries(foregroundSizes)) {
    const mipmapDir = path.join(androidResDir, `mipmap-${density}`);

    // ic_launcher_foreground.png - adaptive icon foreground
    // The foreground needs padding as per Android adaptive icon specs (safe zone is 66/108)
    const logoSize = Math.round(size * 0.66);
    const padding = Math.round((size - logoSize) / 2);

    await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(mipmapDir, 'ic_launcher_foreground.png'));

    console.log(`✅ Generated mipmap-${density}/ic_launcher_foreground.png (${size}x${size})`);
  }

  // Generate splash screen icons for different densities
  const splashConfigs = [
    { dir: 'drawable', size: 288 },
    { dir: 'drawable-port-mdpi', size: 288 },
    { dir: 'drawable-port-hdpi', size: 432 },
    { dir: 'drawable-port-xhdpi', size: 576 },
    { dir: 'drawable-port-xxhdpi', size: 864 },
    { dir: 'drawable-port-xxxhdpi', size: 1152 },
    { dir: 'drawable-land-mdpi', size: 288 },
    { dir: 'drawable-land-hdpi', size: 432 },
    { dir: 'drawable-land-xhdpi', size: 576 },
    { dir: 'drawable-land-xxhdpi', size: 864 },
    { dir: 'drawable-land-xxxhdpi', size: 1152 },
  ];

  for (const config of splashConfigs) {
    const drawableDir = path.join(androidResDir, config.dir);

    if (!fs.existsSync(drawableDir)) {
      fs.mkdirSync(drawableDir, { recursive: true });
    }

    await sharp(logoPath)
      .resize(config.size, config.size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(drawableDir, 'splash.png'));

    console.log(`✅ Generated ${config.dir}/splash.png (${config.size}x${config.size})`);
  }

  // Generate Play Store assets
  const playStoreDir = path.join(projectRoot, 'android', 'playstore-assets');
  if (!fs.existsSync(playStoreDir)) {
    fs.mkdirSync(playStoreDir, { recursive: true });
  }

  // High-res icon (512x512) - required for Play Store
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(playStoreDir, 'hi-res-icon-512x512.png'));
  console.log('✅ Generated playstore-assets/hi-res-icon-512x512.png');

  // Feature graphic (1024x500) - logo centered on white background
  const featureGraphicWidth = 1024;
  const featureGraphicHeight = 500;
  const logoSizeForFeature = 300;

  await sharp({
    create: {
      width: featureGraphicWidth,
      height: featureGraphicHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp(logoPath)
      .resize(logoSizeForFeature, logoSizeForFeature, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer(),
    gravity: 'center'
  }])
  .png()
  .toFile(path.join(playStoreDir, 'feature-graphic-1024x500.png'));
  console.log('✅ Generated playstore-assets/feature-graphic-1024x500.png');

  // TV banner (1280x720) - optional but good to have
  const tvBannerWidth = 1280;
  const tvBannerHeight = 720;
  const logoSizeForTV = 400;

  await sharp({
    create: {
      width: tvBannerWidth,
      height: tvBannerHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{
    input: await sharp(logoPath)
      .resize(logoSizeForTV, logoSizeForTV, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer(),
    gravity: 'center'
  }])
  .png()
  .toFile(path.join(playStoreDir, 'tv-banner-1280x720.png'));
  console.log('✅ Generated playstore-assets/tv-banner-1280x720.png');

  // Generate PWA icons for public/icons
  console.log('\n📱 Generating PWA icons...');
  const pwaIconsDir = path.join(projectRoot, 'public', 'icons');

  if (!fs.existsSync(pwaIconsDir)) {
    fs.mkdirSync(pwaIconsDir, { recursive: true });
  }

  const pwaSizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];

  for (const size of pwaSizes) {
    await sharp(logoPath)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(pwaIconsDir, `icon-${size}x${size}.png`));

    console.log(`✅ Generated icons/icon-${size}x${size}.png`);
  }

  // Maskable icons (with padding for safe zone - 80% of icon is safe)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const safeSize = Math.round(size * 0.8);
    const padding = Math.round((size - safeSize) / 2);

    await sharp(logoPath)
      .resize(safeSize, safeSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(pwaIconsDir, `maskable-${size}x${size}.png`));

    console.log(`✅ Generated icons/maskable-${size}x${size}.png`);
  }

  // Play store icon in public/icons
  await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(pwaIconsDir, 'play-store-icon.png'));
  console.log('✅ Generated icons/play-store-icon.png');

  // Main app icon at src/app/icon.png (with white background and rounded corners)
  const appIconSize = 192;
  const appIconPath = path.join(projectRoot, 'src', 'app', 'icon.png');
  const cornerRadius = Math.round(appIconSize * 0.22); // 22% corner radius for nice rounded look
  const logoPadding = Math.round(appIconSize * 0.08); // 8% padding around logo
  const logoInnerSize = appIconSize - (logoPadding * 2);

  // Create white rounded rectangle background with logo on top
  const roundedBackground = Buffer.from(
    `<svg width="${appIconSize}" height="${appIconSize}">
      <rect x="0" y="0" width="${appIconSize}" height="${appIconSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="white"/>
    </svg>`
  );

  const resizedLogo = await sharp(logoPath)
    .resize(logoInnerSize, logoInnerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp(roundedBackground)
    .composite([{
      input: resizedLogo,
      top: logoPadding,
      left: logoPadding
    }])
    .png()
    .toFile(appIconPath);
  console.log('✅ Generated src/app/icon.png (white bg + rounded corners)');

  // Apple touch icon at src/app/apple-icon.png (with white background and rounded corners)
  const appleIconSize = 180;
  const appleIconPath = path.join(projectRoot, 'src', 'app', 'apple-icon.png');
  const appleCornerRadius = Math.round(appleIconSize * 0.22);
  const applePadding = Math.round(appleIconSize * 0.08);
  const appleLogoSize = appleIconSize - (applePadding * 2);

  const appleRoundedBackground = Buffer.from(
    `<svg width="${appleIconSize}" height="${appleIconSize}">
      <rect x="0" y="0" width="${appleIconSize}" height="${appleIconSize}" rx="${appleCornerRadius}" ry="${appleCornerRadius}" fill="white"/>
    </svg>`
  );

  const appleResizedLogo = await sharp(logoPath)
    .resize(appleLogoSize, appleLogoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp(appleRoundedBackground)
    .composite([{
      input: appleResizedLogo,
      top: applePadding,
      left: applePadding
    }])
    .png()
    .toFile(appleIconPath);
  console.log('✅ Generated src/app/apple-icon.png (white bg + rounded corners)');

  console.log('\n🎉 All icons generated successfully!');
  console.log('\nPlay Store assets saved to:', playStoreDir);
  console.log('PWA icons saved to:', pwaIconsDir);
}

generateIcons().catch(console.error);
