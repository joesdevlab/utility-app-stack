# HoldCo Utility App Stack - Development Roadmap

## Executive Summary

| App | Current State | Production Ready | Estimated Effort |
|-----|---------------|------------------|------------------|
| **Apprentice-Log** | 70% Complete | No | 3-4 weeks |
| **Bio-Swap** | 40% Complete | No | 5-6 weeks |
| **Salvage-Scout** | 35% Complete | No | 4-5 weeks |

---

## Critical Issues (All Apps)

### Security Issues (IMMEDIATE ACTION REQUIRED)

1. **Exposed OpenAI API Key** - Rotate immediately
2. **Unprotected API endpoints** - No authentication on expensive OpenAI calls
3. **No rate limiting** - APIs vulnerable to abuse
4. **Weak password policy** - Only 6 characters required

### Data Storage Issues

1. **Bio-Swap**: All medicine data is hardcoded mock data
2. **Salvage-Scout**: All listings stored in localStorage, not Supabase
3. **Apprentice-Log**: Only app with partial Supabase integration

---

# PHASE 1: Security & Critical Fixes (Week 1-2)

## All Apps

- [x] **SEC-001**: Rotate exposed OpenAI API key (user action required)
- [x] **SEC-002**: Add authentication middleware to all API routes
- [x] **SEC-003**: Implement rate limiting (10 req/min per user)
- [x] **SEC-004**: Add request size validation (max 5MB for images)
- [x] **SEC-005**: Increase password minimum to 8 characters
- [x] **SEC-006**: Enable Supabase Row Level Security (RLS) policies
- [x] **SEC-007**: Remove all console.log/console.error statements
- [x] **SEC-008**: Add React Error Boundaries to all apps

## Apprentice-Log Specific

- [x] **AL-001**: Protect /api/transcribe with auth check
- [x] **AL-002**: Protect /api/format-entry with auth check
- [x] **AL-003**: Add input validation for transcript length (max 10,000 chars)
- [x] **AL-004**: Add file size validation for audio uploads (max 25MB)

## Bio-Swap Specific

- [x] **BS-001**: Add barcode format validation (EAN-13 for NZ medicines)
- [x] **BS-002**: Configure html5-qrcode for multi-format barcode support
- [x] **BS-003**: Remove unused header.tsx component (dead code - already removed)

## Salvage-Scout Specific

- [x] **SS-001**: Add image size validation to /api/analyze
- [x] **SS-002**: Fix fragile JSON parsing in /api/analyze (line 73)
- [x] **SS-003**: Replace alert() with proper contact method implementation

---

# PHASE 2: Database Integration (Week 2-4)

## Bio-Swap - Medicine Database

- [x] **BS-DB-001**: Create `medicines` table in Supabase
  ```sql
  - id, barcode, name, brand_name, generic_name
  - active_ingredient, strength, form, pack_size
  - price, is_generic, is_subsidized, subsidy_price
  - manufacturer, image_url, created_at, updated_at
  ```
- [x] **BS-DB-002**: Create `bioswap_scans` table for scan history
- [x] **BS-DB-003**: Import initial medicine data (40+ NZ medicines seeded)
- [x] **BS-DB-004**: Replace medicine-data.ts with Supabase queries
- [x] **BS-DB-005**: Implement /api/medicines/search endpoint
- [x] **BS-DB-006**: Create scan history page showing past scans

## Salvage-Scout - Listings Database

- [x] **SS-DB-001**: Create `salvage_listings` table in Supabase
- [x] **SS-DB-002**: Create `salvage_claims` table
- [x] **SS-DB-003**: Create Supabase Storage bucket for listing images
- [x] **SS-DB-004**: Migrate use-listings.ts from localStorage to Supabase
- [x] **SS-DB-005**: Implement image upload to Supabase Storage
- [x] **SS-DB-006**: Remove demo listings after migration complete (already done)
- [x] **SS-DB-007**: Create user profiles table for listing owners (using auth.users metadata)

## Apprentice-Log - Database Enhancements

- [x] **AL-DB-001**: Add indexes on user_id and date columns
- [x] **AL-DB-002**: Ensure all entry fields are being saved (weather, siteName, supervisor)
- [x] **AL-DB-003**: Add soft delete support (is_deleted flag)

---

# PHASE 3: Core Feature Completion (Week 4-6)

## Apprentice-Log Features

- [x] **AL-F-001**: Add entry editing capability
- [x] **AL-F-002**: Implement search/filter on history page
- [x] **AL-F-003**: Add date range picker for history
- [x] **AL-F-004**: Add pagination to history (20 entries per page)
- [x] **AL-F-005**: Implement password reset flow
- [x] **AL-F-006**: Add email verification on signup
- [ ] **AL-F-007**: Create PDF export option (BCITO format)
- [x] **AL-F-008**: Add manual entry option (without voice)
- [ ] **AL-F-009**: Implement "Daily Reminder" notifications

## Bio-Swap Features

- [x] **BS-F-001**: Create scan history page
- [x] **BS-F-002**: Implement medicine name search
- [x] **BS-F-003**: Add manual barcode entry field
- [x] **BS-F-004**: Implement password reset flow
- [x] **BS-F-005**: Add email verification on signup
- [x] **BS-F-006**: Add "Add to favorites" functionality
- [x] **BS-F-007**: Create proper error boundary component
- [x] **BS-F-008**: Add image upload fallback for barcode scanning

## Salvage-Scout Features

- [ ] **SS-F-001**: Implement in-app messaging system
- [x] **SS-F-002**: Create user profile pages
- [x] **SS-F-003**: Add search/filter UI (category, condition, distance)
- [x] **SS-F-004**: Implement favorites/saved listings
- [x] **SS-F-005**: Create "My Listings" page
- [x] **SS-F-006**: Add listing edit capability
- [x] **SS-F-007**: Implement listing status updates (available/pending/claimed)
- [x] **SS-F-008**: Add password reset flow
- [x] **SS-F-009**: Implement email verification

---

# PHASE 4: PWA & Offline Support (Week 6-7)

## All Apps

- [ ] **PWA-001**: Implement offline data caching with IndexedDB
- [x] **PWA-002**: Add offline indicator UI component
- [ ] **PWA-003**: Implement background sync for offline actions
- [x] **PWA-004**: Add "install app" prompt component
- [x] **PWA-005**: Create custom offline fallback page
- [x] **PWA-006**: Add cache versioning strategy
- [x] **PWA-007**: Implement stale-while-revalidate for API responses

## Apprentice-Log Offline

- [ ] **AL-PWA-001**: Queue voice recordings when offline
- [ ] **AL-PWA-002**: Sync entries when back online
- [ ] **AL-PWA-003**: Cache recent entries for offline viewing

## Bio-Swap Offline

- [ ] **BS-PWA-001**: Cache recent medicine lookups
- [ ] **BS-PWA-002**: Store scan history locally
- [ ] **BS-PWA-003**: Show cached results when offline

## Salvage-Scout Offline

- [ ] **SS-PWA-001**: Cache nearby listings
- [ ] **SS-PWA-002**: Queue new listings when offline
- [ ] **SS-PWA-003**: Sync messages when back online

---

# PHASE 5: Accessibility & Polish (Week 7-8)

## All Apps

- [x] **A11Y-001**: Add aria-labels to all icon-only buttons
- [x] **A11Y-002**: Implement skip-to-content links
- [x] **A11Y-003**: Add prefers-reduced-motion support
- [x] **A11Y-004**: Ensure all form inputs have associated labels
- [x] **A11Y-005**: Add aria-live regions for dynamic updates
- [x] **A11Y-006**: Implement keyboard focus management in modals
- [x] **A11Y-007**: Add proper heading hierarchy
- [x] **A11Y-008**: Ensure color contrast meets WCAG AA

## Apprentice-Log Polish

- [x] **AL-P-001**: Add skeleton loading states
- [ ] **AL-P-002**: Implement theme toggle in settings
- [ ] **AL-P-003**: Add hours/skills statistics dashboard
- [ ] **AL-P-004**: Improve error messages with specific codes

## Bio-Swap Polish

- [x] **BS-P-001**: Add loading skeletons for medicine cards
- [ ] **BS-P-002**: Improve barcode scanner UI feedback
- [ ] **BS-P-003**: Add pharmacy locator feature (nice-to-have)
- [ ] **BS-P-004**: Create "About Generic Medicines" education section

## Salvage-Scout Polish

- [x] **SS-P-001**: Add skeleton loading states
- [ ] **SS-P-002**: Implement map view for listings
- [ ] **SS-P-003**: Add multiple image support per listing
- [ ] **SS-P-004**: Implement user ratings/reviews

---

# PHASE 6: Testing & Documentation (Week 8-9)

## All Apps

- [x] **TEST-001**: Set up Jest/Vitest testing framework
- [x] **TEST-002**: Write unit tests for custom hooks
- [x] **TEST-003**: Write unit tests for API routes
- [x] **TEST-004**: Set up Playwright for E2E testing
- [x] **TEST-005**: Write E2E tests for auth flows
- [x] **TEST-006**: Write E2E tests for main user journeys
- [ ] **TEST-007**: Add visual regression testing
- [x] **DOC-001**: Create API documentation
- [x] **DOC-002**: Update README files with setup instructions
- [x] **DOC-003**: Document deployment procedures

---

# PHASE 7: Production Deployment (Week 9-10)

## Pre-Deployment Checklist

- [x] **DEPLOY-001**: Set up error monitoring (Sentry)
- [x] **DEPLOY-002**: Configure analytics (Plausible/PostHog)
- [x] **DEPLOY-003**: Set up database backups in Supabase
- [ ] **DEPLOY-004**: Configure CDN for images
- [ ] **DEPLOY-005**: Set up custom domains
- [ ] **DEPLOY-006**: Configure SSL certificates
- [x] **DEPLOY-007**: Set up CI/CD pipelines
- [x] **DEPLOY-008**: Create staging environment
- [ ] **DEPLOY-009**: Load testing and performance optimization
- [ ] **DEPLOY-010**: Security audit and penetration testing

---

# Future Enhancements (Post-Launch)

## Apprentice-Log

- [ ] Multi-user features (supervisor sign-off)
- [ ] Photo attachment for work documentation
- [ ] Integration with BCITO systems
- [ ] Weekly/monthly summary reports
- [ ] Accent/dialect optimization for Whisper

## Bio-Swap

- [ ] Real-time pharmacy price integration
- [ ] Pharmacy availability checking
- [ ] Integration with NZ Universal List of Medicines (NZULM)
- [ ] Price drop alerts
- [ ] Insurance/subsidy calculator

## Salvage-Scout

- [ ] Admin moderation dashboard
- [ ] Environmental impact tracking
- [ ] Social features (following, comments)
- [ ] Auction/bidding system
- [ ] Integration with local environmental groups

---

# Priority Matrix

## Immediate (This Week)
1. Rotate API keys
2. Add auth to API routes
3. Remove debug statements
4. Fix critical security issues

## Short-term (Next 2 Weeks)
1. Database integration for all apps
2. Core feature completion
3. Error boundaries

## Medium-term (Week 3-6)
1. PWA/offline support
2. Accessibility fixes
3. Testing setup

## Long-term (Week 7+)
1. Polish features
2. Production deployment
3. Future enhancements

---

# Effort Estimates by App

## Apprentice-Log
- Security fixes: 8 hours
- Database enhancements: 4 hours
- Core features: 24 hours
- PWA/Offline: 12 hours
- Accessibility: 8 hours
- Testing: 16 hours
- **Total: ~72 hours (3 weeks at 24 hrs/week)**

## Bio-Swap
- Security fixes: 8 hours
- Database integration: 32 hours (medicine data import)
- Core features: 24 hours
- PWA/Offline: 12 hours
- Accessibility: 8 hours
- Testing: 16 hours
- **Total: ~100 hours (4-5 weeks at 24 hrs/week)**

## Salvage-Scout
- Security fixes: 12 hours
- Database migration: 24 hours
- Core features: 32 hours (messaging is complex)
- PWA/Offline: 12 hours
- Accessibility: 8 hours
- Testing: 16 hours
- **Total: ~104 hours (4-5 weeks at 24 hrs/week)**

---

# Summary

**Current State**: All three apps have solid foundations but are NOT production-ready.

**Critical Blockers**:
1. Security vulnerabilities (exposed keys, unprotected APIs)
2. Missing database integration (Bio-Swap medicine data, Salvage-Scout listings)
3. Missing core features (messaging in Salvage-Scout, entry editing in Apprentice-Log)

**Recommended Approach**:
1. Fix security issues immediately (Phase 1)
2. Complete database integration (Phase 2)
3. Ship core features incrementally (Phase 3+)

**Total Estimated Effort**: 12-14 weeks for all three apps to production-ready state.
