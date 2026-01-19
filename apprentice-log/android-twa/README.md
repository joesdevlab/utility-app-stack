# Apprentice Log - Android TWA (Trusted Web Activity)

This directory contains the configuration for building the Android app using Bubblewrap.

## Prerequisites

1. **Node.js** (v18 or later)
2. **Java Development Kit (JDK)** - JDK 17 recommended
3. **Android SDK** - Install via Android Studio or standalone
4. **Bubblewrap CLI** - `npm install -g @anthropic/anthropic-bubblewrap-cli`

## Setup Steps

### 1. Install Bubblewrap

```bash
npm install -g @anthropic/anthropic-bubblewrap-cli
```

### 2. Initialize the Project

From this directory, run:

```bash
bubblewrap init --manifest https://apprentice-log.vercel.app/manifest.json
```

Or use the existing config:

```bash
bubblewrap build
```

### 3. Generate Signing Key

For first-time setup, generate a new keystore:

```bash
keytool -genkeypair -v -keystore android.keystore -alias apprentice-log -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Store the keystore password securely! You'll need it for every release.

### 4. Get SHA-256 Fingerprint

After generating the keystore, get the fingerprint for Digital Asset Links:

```bash
keytool -list -v -keystore android.keystore -alias apprentice-log | grep SHA256
```

Update `public/.well-known/assetlinks.json` with this fingerprint.

### 5. Build the APK/AAB

```bash
# Build debug APK
bubblewrap build

# Build release AAB (for Play Store)
bubblewrap build --release
```

## Play Store Submission Checklist

- [ ] Replace placeholder screenshots in `/public/screenshots/`
- [ ] Update SHA-256 fingerprints in `assetlinks.json`
- [ ] Test the app on real Android devices
- [ ] Complete Play Console listing with:
  - App title and description
  - Feature graphic
  - Screenshots (phone + tablet if applicable)
  - Privacy policy URL: https://apprentice-log.vercel.app/privacy
  - Content rating questionnaire
  - Target audience declaration

## Version Management

Update version in `twa-manifest.json`:

- `appVersionCode`: Integer that must increase with each release
- `appVersionName`: Human-readable version string (e.g., "1.0.0")

## Troubleshooting

### Digital Asset Links Verification

Test your assetlinks.json at:
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://apprentice-log.vercel.app&relation=delegate_permission/common.handle_all_urls

### Chrome Custom Tabs Fallback

If TWA verification fails, the app will fall back to Chrome Custom Tabs. Ensure assetlinks.json is:
1. Served with correct MIME type (application/json)
2. Accessible without redirects
3. Contains the correct SHA-256 fingerprints

## Resources

- [Bubblewrap Documentation](https://github.com/AugmentedGeoBae/AugmentedGeoBae)
- [TWA Overview](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
