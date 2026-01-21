# Android Build Instructions for Google Play Store

## Prerequisites

1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java JDK 17+** - Required for Android builds
3. **A Google Play Developer account** - $25 one-time fee at https://play.google.com/console

## Quick Start (Debug APK)

From the `apprentice-log` directory:

```bash
# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

In Android Studio:
1. Build > Build Bundle(s) / APK(s) > Build APK(s)
2. APK will be in `android/app/build/outputs/apk/debug/`

## Production Release Build

### Step 1: Create a Keystore

Generate a release keystore (keep this file safe - you'll need it for all future updates!):

```bash
keytool -genkey -v -keystore release-key.keystore -alias apprentice-log -keyalg RSA -keysize 2048 -validity 10000
```

Move `release-key.keystore` to `android/app/release-key.keystore`

### Step 2: Configure Signing

Edit `android/app/build.gradle` and uncomment the signing configuration:

```gradle
signingConfigs {
    release {
        storeFile file('release-key.keystore')
        storePassword System.getenv('KEYSTORE_PASSWORD') ?: 'your-password'
        keyAlias 'apprentice-log'
        keyPassword System.getenv('KEY_PASSWORD') ?: 'your-password'
    }
}

buildTypes {
    release {
        // ...
        signingConfig signingConfigs.release
    }
}
```

### Step 3: Build Release APK/AAB

```bash
# From apprentice-log directory
npx cap sync android

# Build release APK
cd android
./gradlew assembleRelease

# Or build Android App Bundle (recommended for Play Store)
./gradlew bundleRelease
```

Output locations:
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## App Store Listing Requirements

### App Icon
- 512x512 PNG icon for store listing
- Located in `android/app/src/main/res/mipmap-*/`
- Use Android Studio's Asset Studio to generate all sizes

### Screenshots
- At least 2 screenshots required
- Recommended: Phone (1080x1920) and Tablet (1200x1920)

### Store Listing Info
- **App name**: Apprentice Log
- **Short description**: Voice-to-logbook for NZ apprentices
- **Full description**: Record your work day with your voice. Apprentice Log transcribes and formats your entries for BCITO compliance.
- **Category**: Tools / Productivity
- **Content rating**: Everyone

### Privacy Policy
Required. Host at: https://apprenticelog.nz/privacy

## Update Process

1. Increment `versionCode` and `versionName` in `android/app/build.gradle`
2. Run `npx cap sync android`
3. Build new release
4. Upload to Google Play Console

## Troubleshooting

### Build fails with Java version error
Ensure `JAVA_HOME` points to JDK 17+:
```bash
java -version
```

### Microphone permission not working
The app requests microphone permission at runtime. If denied, direct users to Settings > Apps > Apprentice Log > Permissions.

### WebView not loading
- Check internet connection
- Verify `https://apprenticelog.nz` is accessible
- Check Capacitor config URL is correct

## Environment Variables

For CI/CD builds, set these environment variables:
- `KEYSTORE_PASSWORD` - Keystore password
- `KEY_PASSWORD` - Key password

## Firebase App Distribution (Beta Testing)

Firebase App Distribution is set up for distributing beta builds to testers.

### Project Details
- **Firebase Project**: `apprentice-log-prod`
- **App ID**: `1:521381318244:android:ccc17d39ecd4c0b32a9971`
- **Console**: https://console.firebase.google.com/project/apprentice-log-prod/appdistribution

### Current Testers
- laikadynamics@gmail.com
- zedvex@gmail.com

### Distribute a New Build

```bash
# From apprentice-log directory

# 1. Sync web assets
npx cap sync android

# 2. Build debug APK
cd android && ./gradlew assembleDebug && cd ..

# 3. Upload and distribute to testers
firebase appdistribution:distribute android/app/build/outputs/apk/debug/app-debug.apk \
  --project apprentice-log-prod \
  --app 1:521381318244:android:ccc17d39ecd4c0b32a9971 \
  --testers "laikadynamics@gmail.com,zedvex@gmail.com" \
  --release-notes "Your release notes here"
```

### Add New Testers

```bash
firebase appdistribution:testers:add --project apprentice-log-prod email1@example.com email2@example.com
```

### What Testers Need To Do
1. Check email for Firebase invitation
2. Click link and sign in with Google
3. Install "Firebase App Tester" app (if prompted)
4. Download and install Apprentice Log

## Support

For issues: https://github.com/your-repo/apprentice-log/issues
