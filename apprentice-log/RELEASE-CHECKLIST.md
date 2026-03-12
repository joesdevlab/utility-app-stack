# Apprentice Log — Android Release Checklist

## Pre-Build Steps

### 1. Fix Keystore Password
The keystore password in `android/app/build.gradle` (line 23-25) didn't match the actual keystore.
Fix the password or regenerate the keystore:

```bash
# Option A: Regenerate keystore with the password in build.gradle
keytool -genkeypair -v -keystore apprentice-log.keystore -alias apprentice-log-key -keyalg RSA -keysize 2048 -validity 10000

# Option B: Update build.gradle lines 23-25 to match your actual keystore password
```

> **Security note:** Move passwords out of `build.gradle` into `local.properties` or environment variables before making the repo public. See "Security Hardening" section below.

### 2. Extract SHA-256 Fingerprint & Update Asset Links
After fixing the keystore, get the fingerprint:

```bash
keytool -list -v -keystore apprentice-log.keystore -alias apprentice-log-key
```

Copy the `SHA256:` fingerprint (format: `AA:BB:CC:...`) and update both entries in:
**`public/.well-known/assetlinks.json`** — replace `TODO_UPLOAD_KEY_FINGERPRINT` with the actual fingerprint.

After uploading to Play Console, you'll also need to add the **Play App Signing key** fingerprint
(found in Play Console → Setup → App signing → App signing key certificate → SHA-256).

### 3. Sync Capacitor
```bash
cd apprentice-log
npx cap sync android
```

---

## Building the Release

### From Android Studio (recommended on Windows)
1. Open `apprentice-log/android` in Android Studio
2. Build → Generate Signed Bundle / APK
3. Choose **Android App Bundle** (AAB) for Play Store, or **APK** for direct device testing
4. Select existing keystore: `apprentice-log.keystore` (in the `apprentice-log/` root)
5. Build variant: `release`

### From Command Line (macOS/Linux)
```bash
cd apprentice-log/android
./gradlew bundleRelease    # AAB for Play Store
./gradlew assembleRelease  # APK for device testing
```

Output locations:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## Device Testing (Test on 2-3 devices before submission)

### Install APK on Device
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Test Checklist

#### Core Functionality
- [ ] App launches and shows splash screen (orange, 2s)
- [ ] WebView loads `https://apprenticelog.nz/app` correctly
- [ ] Sign in / sign up flow works
- [ ] Email verification flow works
- [ ] Voice recording works (microphone permission prompt appears)
- [ ] Transcription + formatting completes successfully
- [ ] Logbook entries display in history
- [ ] PDF export downloads correctly (BCITO format)
- [ ] CSV export works from settings

#### Daily Reminders
- [ ] Settings → Daily Reminder toggle works
- [ ] Notification permission prompt appears (Android 13+)
- [ ] Notification fires at scheduled time
- [ ] Tapping notification opens the app

#### Offline Support
- [ ] Enable airplane mode → app shows offline indicator
- [ ] Record voice offline → shows "saved offline" toast
- [ ] Pending entries banner shows audio count
- [ ] Re-enable network → entries sync automatically
- [ ] Synced entries appear correctly in history

#### Deep Links
- [ ] `https://apprenticelog.nz` opens in the app (not browser)
- [ ] `https://apprenticelog.nz/app` opens in the app
- [ ] App-to-web navigation works correctly

#### Visual / UX
- [ ] App icon displays correctly on home screen
- [ ] App name shows "Apprentice Log" under icon
- [ ] No white flash on launch (splash screen covers it)
- [ ] Back button behavior is correct (doesn't exit app unexpectedly)
- [ ] Keyboard doesn't cover input fields
- [ ] Landscape orientation works if supported

#### Edge Cases
- [ ] Kill app and reopen — state persists
- [ ] Low network / slow connection — loading states appear
- [ ] Large number of entries (50+) — history scrolls smoothly

---

## Play Console: Internal Testing Track

### First-Time Setup
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - App name: **Apprentice Log**
   - Default language: **English (New Zealand)**
   - App or game: **App**
   - Free or paid: **Free**
3. Complete the **Dashboard setup tasks**:
   - App access: "All functionality is available without special access"
   - Ads: "No, my app does not contain ads"
   - Content rating: Complete the questionnaire
   - Target audience: 18+ (trade workers)
   - News app: No
   - COVID-19 app: No
   - Data safety: Fill in based on actual data collection (see below)

### Data Safety Declaration
Based on the app's actual data collection:
| Data Type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Name | Yes | No | Account management |
| Voice/audio | Yes | No | Core functionality (transcription) |
| App activity | Yes | No | Analytics (Sentry) |
| Crash logs | Yes | No | App stability (Sentry) |

- Data is encrypted in transit (HTTPS/TLS)
- Users can request deletion (Supabase account deletion)
- Data is processed by: Supabase (database), OpenAI (transcription), Stripe (billing)

### Upload AAB to Internal Testing
1. Go to **Testing → Internal testing**
2. Click **Create new release**
3. Upload the `app-release.aab` file
4. Release name: `1.0.0 (1)` — matches versionName/versionCode in build.gradle
5. Release notes:
   ```
   Initial release of Apprentice Log for NZ trade apprentices.
   - Voice-to-text logbook entries
   - BCITO-format PDF export
   - Daily reminder notifications
   - Offline voice recording with auto-sync
   - Employer portal integration
   ```
6. **Review and roll out** to internal testing

### Add Internal Testers
1. Go to **Testing → Internal testing → Testers**
2. Create an email list (e.g., "Internal Testers")
3. Add tester email addresses (must be Google accounts)
4. Share the **opt-in link** with testers
5. Testers accept the invite, then can install from Play Store

---

## Custom Domain: Vercel Setup

### DNS Configuration
Add these records at your domain registrar for `apprenticelog.nz`:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 76.76.21.21              |
| CNAME | www  | cname.vercel-dns.com     |

### Vercel Dashboard
1. Go to your Vercel project → Settings → Domains
2. Add `apprenticelog.nz`
3. Add `www.apprenticelog.nz` (set to redirect to apex)
4. SSL is provisioned automatically by Vercel (Let's Encrypt)
5. Set `apprenticelog.nz` as the primary domain

### Verify After DNS Propagation
- [ ] `https://apprenticelog.nz` loads correctly
- [ ] `https://www.apprenticelog.nz` redirects to `https://apprenticelog.nz`
- [ ] SSL certificate is valid (check padlock icon)
- [ ] `https://apprenticelog.nz/.well-known/assetlinks.json` returns correct JSON
- [ ] PWA install works on the custom domain

---

## Email Addresses

Set up these email addresses for store listing and legal compliance:

| Address | Purpose | Needed For |
|---------|---------|------------|
| support@apprenticelog.nz | User support | Play Store listing (required) |
| privacy@apprenticelog.nz | Privacy inquiries | Privacy policy |
| legal@apprenticelog.nz | Legal/DMCA | Terms of service |

Options for setup:
- **Google Workspace** — full email hosting (~$7/user/month)
- **Zoho Mail** — free tier for 5 users
- **Email forwarding** — forward to your personal email (cheapest, via registrar)

### Verify Emails Work
- [ ] Send test email to support@apprenticelog.nz — confirm receipt
- [ ] Send test email to privacy@apprenticelog.nz — confirm receipt
- [ ] Reply from each address — confirm outbound works

---

## Security Hardening (Before Going Public)

### Move Keystore Passwords Out of build.gradle

1. Add to `android/local.properties` (already gitignored):
```properties
RELEASE_STORE_PASSWORD=YourActualPassword
RELEASE_KEY_PASSWORD=YourActualPassword
```

2. Update `android/app/build.gradle` signing config:
```groovy
signingConfigs {
    release {
        storeFile file('../../apprentice-log.keystore')
        storePassword project.hasProperty('RELEASE_STORE_PASSWORD') ? RELEASE_STORE_PASSWORD : ''
        keyAlias 'apprentice-log-key'
        keyPassword project.hasProperty('RELEASE_KEY_PASSWORD') ? RELEASE_KEY_PASSWORD : ''
    }
}
```

3. Add to `.gitignore` if not already:
```
*.keystore
*.jks
```

---

## Version Bumping (For Future Releases)

Update both values in `android/app/build.gradle`:
```groovy
versionCode 2        // Increment by 1 for each upload
versionName "1.1.0"  // Semantic version for display
```

Play Store requires `versionCode` to increase with every upload. The `versionName` is what users see.

---

## Final Pre-Submission Checklist

- [ ] Keystore password fixed and fingerprint extracted
- [ ] `assetlinks.json` updated with real SHA-256 fingerprints
- [ ] `npx cap sync android` run after all changes
- [ ] Release APK tested on 2-3 real devices
- [ ] All device test checklist items pass
- [ ] Custom domain DNS configured and SSL working
- [ ] Email addresses set up and verified
- [ ] Play Console app created with all setup tasks complete
- [ ] Data safety declaration filled in accurately
- [ ] AAB uploaded to internal testing track
- [ ] Internal testers added and can install
- [ ] Privacy policy URL live at `https://apprenticelog.nz/privacy`
- [ ] Keystore passwords moved out of `build.gradle` (security)
