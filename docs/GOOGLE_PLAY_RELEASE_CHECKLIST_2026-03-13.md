# Google Play Store Release Checklist — Apprentice Log

**Date:** 2026-03-13
**App:** Apprentice Log (`nz.apprenticelog.app`)
**Target:** Google Play Internal Testing Track

---

## Executive Summary

Feature audit confirms apprentice-log is **feature-complete** for initial release. Auth, voice logging, employer portal, PDF/CSV export, offline sync, push notifications, and error handling are all implemented. What remains is security hardening, build configuration, and store submission.

---

## 1. Critical Security Fixes (MUST DO)

### 1.1 Debug Mode in Capacitor Config
- **File:** `apprentice-log/capacitor.config.ts:16`
- **Issue:** `webContentsDebuggingEnabled` was hardcoded to `true`
- **Status:** FIXED — now uses `process.env.NODE_ENV !== 'production'`

### 1.2 Keystore Passwords Hardcoded in build.gradle
- **File:** `apprentice-log/android/app/build.gradle` (lines 20-27)
- **Issue:** `storePassword` and `keyPassword` are plaintext in source
- **Action:** Move to environment variables:
  ```gradle
  storePassword System.getenv('KEYSTORE_PASSWORD')
  keyPassword System.getenv('KEY_PASSWORD')
  ```

### 1.3 Keystore File Committed to Git
- **File:** `apprentice-log/apprentice-log.keystore`
- **Issue:** Signing key is in the repository — anyone with access can sign APKs
- **Action:**
  1. Add `*.keystore` to `.gitignore`
  2. Remove from git history: `git filter-branch --tree-filter 'rm -f apprentice-log.keystore' HEAD`
  3. Store keystore in a secure offline location or CI/CD secret vault

### 1.4 API Keys Exposed in .env.vercel
- **File:** `apprentice-log/.env.vercel`
- **Issue:** Contains live OpenAI API key, Supabase auth hook secret, Vercel OIDC token
- **Action:**
  1. Rotate OpenAI API key immediately
  2. Regenerate Supabase auth hook secret
  3. Remove `.env.vercel` from git history
  4. Add `.env.vercel` to `.gitignore`

---

## 2. Release Build Prep

### 2.1 Build Configuration
- [ ] Verify signing config uses env vars (not hardcoded passwords)
- [ ] Build release AAB: `npm run android:build:release`
- [ ] Confirm output at `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] Version code: `1`, version name: `1.0.0` (appropriate for first release)

### 2.2 Build Verification
- [ ] Install release build on a real Android device (not emulator)
- [ ] Test voice recording + transcription flow end-to-end
- [ ] Test employer login and dashboard
- [ ] Test offline → online sync
- [ ] Test push notification daily reminder
- [ ] Verify deep links open the app (`https://apprenticelog.nz/*`)
- [ ] Confirm splash screen displays correctly
- [ ] Verify microphone permission prompt appears on first use

---

## 3. Google Play Console Setup

### 3.1 Account & App Creation
- [ ] Create Google Play Developer account ($25 one-time fee) at https://play.google.com/console
- [ ] Create new app in Play Console
- [ ] App name: **Apprentice Log**
- [ ] Default language: **English (New Zealand)**
- [ ] App type: **App** (not Game)
- [ ] Free or paid: **Free** (Stripe handles in-app payments)

### 3.2 Store Listing
- [ ] **App name** (30 chars): Apprentice Log
- [ ] **Short description** (80 chars): Voice-to-logbook for BCITO apprentices. Speak your work, we write it up.
- [ ] **Full description** (4000 chars): Use content from `android-twa/PLAY_STORE_LISTING.md`
- [ ] **Category:** Productivity
- [ ] **Developer name:** Update from "AppLog Developer" to legal entity
- [ ] **Developer email:** support@apprenticelog.nz
- [ ] **Developer website:** https://apprenticelog.nz
- [ ] **Privacy policy URL:** https://apprenticelog.nz/privacy

### 3.3 Store Assets (all present in repo)
| Asset | Location | Spec |
|-------|----------|------|
| Hi-res icon | `public/icons/play-store-icon.png` | 512x512 PNG |
| Feature graphic | `android/playstore-assets/feature-graphic.png` | 1024x500 PNG |
| Screenshot 1 | `public/screenshots/screenshot-1.png` | 1080x1920 |
| Screenshot 2 | `public/screenshots/screenshot-2.png` | 1080x1920 |
| Screenshot 3 | `public/screenshots/screenshot-3.png` | 1080x1920 |

### 3.4 Play Console Declarations
- [ ] Complete **content rating questionnaire** (IARC — takes ~5 min)
- [ ] Complete **data safety declaration** (reference: `android-twa/PLAY_STORE_LISTING.md`)
- [ ] Declare **ads:** No ads
- [ ] Declare **target audience:** 16+ (matches privacy policy)
- [ ] Confirm **app access:** All functionality requires login (provide test credentials to reviewers)

---

## 4. Deployment Path

### 4.1 Internal Testing (Day 1-2)
- [ ] Upload AAB to **Internal Testing** track in Play Console
- [ ] Add up to 100 testers by email (employers + apprentices)
- [ ] No Google review required — available instantly
- [ ] Testers install via Play Store opt-in link

### 4.2 Closed Testing (Week 2+)
- [ ] Graduate to **Closed Testing** after initial feedback
- [ ] Requires brief Google review (~1-3 days)
- [ ] Expand tester pool

### 4.3 Production Release (When Ready)
- [ ] Graduate to **Production** track
- [ ] Full Google review (~1-7 days for first submission)
- [ ] Increment `versionCode` for each update

---

## 5. Domain & Infrastructure Prerequisites

- [ ] Verify `https://apprenticelog.nz` is live and serving the web app
- [ ] Verify `https://apprenticelog.nz/privacy` is accessible
- [ ] Verify `https://apprenticelog.nz/terms` is accessible
- [ ] Set up Digital Asset Links file at `https://apprenticelog.nz/.well-known/assetlinks.json` for deep link verification
- [ ] Confirm email addresses are active: `support@`, `privacy@`, `legal@` @apprenticelog.nz

---

## 6. Features Confirmed Complete

The following were audited against the codebase on 2026-03-13:

| Feature | Status | Key Files |
|---------|--------|-----------|
| Auth (sign in/up, password reset, email verify, MFA) | COMPLETE | `src/app/auth/`, `src/components/auth-form.tsx` |
| Voice recording + transcription (Whisper) | COMPLETE | `src/components/voice-recorder.tsx`, `src/app/api/transcribe/` |
| AI entry formatting (GPT-4o-mini) | COMPLETE | `src/app/api/format-entry/` |
| Manual entry form | COMPLETE | `src/components/manual-entry-form.tsx` |
| Entry history (view, edit, delete, search, filter) | COMPLETE | `src/app/app/history/` |
| PDF export (BCITO format) | COMPLETE | `src/lib/pdf-export.ts` |
| CSV export | COMPLETE | `src/app/app/settings/page.tsx` |
| Employer dashboard | COMPLETE | `src/app/employer/dashboard/` |
| Apprentice management | COMPLETE | `src/app/employer/apprentices/` |
| Team management + invites | COMPLETE | `src/app/employer/team/` |
| Billing (Stripe) | COMPLETE | `src/app/employer/billing/` |
| Report generation (employer) | COMPLETE | `src/components/employer/report-generator.tsx` |
| Daily reminder notifications | COMPLETE | `src/lib/notifications.ts`, `src/hooks/use-daily-reminder.ts` |
| Offline support + background sync | COMPLETE | `public/sw-custom.js`, `src/lib/offline-storage.ts` |
| Error boundaries | COMPLETE | `src/components/error-boundary.tsx` |
| Settings (2FA, export, delete account) | COMPLETE | `src/app/app/settings/page.tsx` |
| Sentry error tracking | COMPLETE | `next.config.ts` |
| Security headers (HSTS, CSP, X-Frame) | COMPLETE | `next.config.ts` |
| Rate limiting | COMPLETE | API middleware |
| Privacy policy + Terms of Service | COMPLETE | `src/app/privacy/`, `src/app/terms/` |
| Store listing assets | COMPLETE | `public/icons/`, `public/screenshots/`, `android/playstore-assets/` |

---

## 7. Android Build Configuration Summary

| Setting | Value |
|---------|-------|
| App ID | `nz.apprenticelog.app` |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 36 (Android 15) |
| Compile SDK | 36 |
| Version Code | 1 |
| Version Name | 1.0.0 |
| Minification | Enabled (ProGuard) |
| Resource shrinking | Enabled |
| Bundle splits | Language, density, ABI |
| Server URL | `https://apprenticelog.nz/app` |
| Scheme | HTTPS |
| Firebase | Configured (`google-services.json`) |

---

## 8. Post-Launch Monitoring

- [ ] Monitor Sentry dashboard for crash reports
- [ ] Monitor Play Console for ANRs and crashes
- [ ] Watch Play Store reviews and respond promptly
- [ ] Track install/uninstall rates in Play Console
- [ ] Plan v1.0.1 patch release for any issues found during testing
