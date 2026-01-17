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

- [ ] **SEC-001**: Rotate exposed OpenAI API key
- [ ] **SEC-002**: Add authentication middleware to all API routes
- [ ] **SEC-003**: Implement rate limiting (10 req/min per user)
- [ ] **SEC-004**: Add request size validation (max 5MB for images)
- [ ] **SEC-005**: Increase password minimum to 8 characters
- [ ] **SEC-006**: Enable Supabase Row Level Security (RLS) policies
- [ ] **SEC-007**: Remove all console.log/console.error statements
- [ ] **SEC-008**: Add React Error Boundaries to all apps

## Apprentice-Log Specific

- [ ] **AL-001**: Protect /api/transcribe with auth check
- [ ] **AL-002**: Protect /api/format-entry with auth check
- [ ] **AL-003**: Add input validation for transcript length (max 10,000 chars)
- [ ] **AL-004**: Add file size validation for audio uploads (max 25MB)

## Bio-Swap Specific

- [ ] **BS-001**: Add barcode format validation (EAN-13 for NZ medicines)
- [ ] **BS-002**: Configure html5-qrcode for multi-format barcode support
- [ ] **BS-003**: Remove unused header.tsx component (dead code)

## Salvage-Scout Specific

- [ ] **SS-001**: Add image size validation to /api/analyze
- [ ] **SS-002**: Fix fragile JSON parsing in /api/analyze (line 73)
- [ ] **SS-003**: Replace alert() with proper contact method implementation

---

# PHASE 2: Database Integration (Week 2-4)

## Bio-Swap - Medicine Database

- [ ] **BS-DB-001**: Create `medicines` table in Supabase
  ```sql
  - id, barcode, name, brand_name, generic_name
  - active_ingredient, strength, form, pack_size
  - price, is_generic, is_subsidized, subsidy_price
  - manufacturer, image_url, created_at, updated_at
  ```
- [ ] **BS-DB-002**: Create `bioswap_scans` table for scan history
- [ ] **BS-DB-003**: Import initial medicine data (start with 100 common medicines)
- [ ] **BS-DB-004**: Replace medicine-data.ts with Supabase queries
- [ ] **BS-DB-005**: Implement /api/medicines/search endpoint
- [ ] **BS-DB-006**: Create scan history page showing past scans

## Salvage-Scout - Listings Database

- [ ] **SS-DB-001**: Create `salvage_listings` table in Supabase
- [ ] **SS-DB-002**: Create `salvage_claims` table
- [ ] **SS-DB-003**: Create Supabase Storage bucket for listing images
- [ ] **SS-DB-004**: Migrate use-listings.ts from localStorage to Supabase
- [ ] **SS-DB-005**: Implement image upload to Supabase Storage
- [ ] **SS-DB-006**: Remove demo listings after migration complete
- [ ] **SS-DB-007**: Create user profiles table for listing owners

## Apprentice-Log - Database Enhancements

- [ ] **AL-DB-001**: Add indexes on user_id and date columns
- [ ] **AL-DB-002**: Ensure all entry fields are being saved (weather, siteName, supervisor)
- [ ] **AL-DB-003**: Add soft delete support (is_deleted flag)

---

# PHASE 3: Core Feature Completion (Week 4-6)

## Apprentice-Log Features

- [ ] **AL-F-001**: Add entry editing capability
- [ ] **AL-F-002**: Implement search/filter on history page
- [ ] **AL-F-003**: Add date range picker for history
- [ ] **AL-F-004**: Add pagination to history (20 entries per page)
- [ ] **AL-F-005**: Implement password reset flow
- [ ] **AL-F-006**: Add email verification on signup
- [ ] **AL-F-007**: Create PDF export option (BCITO format)
- [ ] **AL-F-008**: Add manual entry option (without voice)
- [ ] **AL-F-009**: Implement "Daily Reminder" notifications

## Bio-Swap Features

- [ ] **BS-F-001**: Create scan history page
- [ ] **BS-F-002**: Implement medicine name search
- [ ] **BS-F-003**: Add manual barcode entry field
- [ ] **BS-F-004**: Implement password reset flow
- [ ] **BS-F-005**: Add email verification on signup
- [ ] **BS-F-006**: Add "Add to favorites" functionality
- [ ] **BS-F-007**: Create proper error boundary component
- [ ] **BS-F-008**: Add image upload fallback for barcode scanning

## Salvage-Scout Features

- [ ] **SS-F-001**: Implement in-app messaging system
- [ ] **SS-F-002**: Create user profile pages
- [ ] **SS-F-003**: Add search/filter UI (category, condition, distance)
- [ ] **SS-F-004**: Implement favorites/saved listings
- [ ] **SS-F-005**: Create "My Listings" page
- [ ] **SS-F-006**: Add listing edit capability
- [ ] **SS-F-007**: Implement listing status updates (available/pending/claimed)
- [ ] **SS-F-008**: Add password reset flow
- [ ] **SS-F-009**: Implement email verification

---

# PHASE 4: PWA & Offline Support (Week 6-7)

## All Apps

- [ ] **PWA-001**: Implement offline data caching with IndexedDB
- [ ] **PWA-002**: Add offline indicator UI component
- [ ] **PWA-003**: Implement background sync for offline actions
- [ ] **PWA-004**: Add "install app" prompt component
- [ ] **PWA-005**: Create custom offline fallback page
- [ ] **PWA-006**: Add cache versioning strategy
- [ ] **PWA-007**: Implement stale-while-revalidate for API responses

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

- [ ] **A11Y-001**: Add aria-labels to all icon-only buttons
- [ ] **A11Y-002**: Implement skip-to-content links
- [ ] **A11Y-003**: Add prefers-reduced-motion support
- [ ] **A11Y-004**: Ensure all form inputs have associated labels
- [ ] **A11Y-005**: Add aria-live regions for dynamic updates
- [ ] **A11Y-006**: Implement keyboard focus management in modals
- [ ] **A11Y-007**: Add proper heading hierarchy
- [ ] **A11Y-008**: Ensure color contrast meets WCAG AA

## Apprentice-Log Polish

- [ ] **AL-P-001**: Add skeleton loading states
- [ ] **AL-P-002**: Implement theme toggle in settings
- [ ] **AL-P-003**: Add hours/skills statistics dashboard
- [ ] **AL-P-004**: Improve error messages with specific codes

## Bio-Swap Polish

- [ ] **BS-P-001**: Add loading skeletons for medicine cards
- [ ] **BS-P-002**: Improve barcode scanner UI feedback
- [ ] **BS-P-003**: Add pharmacy locator feature (nice-to-have)
- [ ] **BS-P-004**: Create "About Generic Medicines" education section

## Salvage-Scout Polish

- [ ] **SS-P-001**: Add listing detail page
- [ ] **SS-P-002**: Implement map view for listings
- [ ] **SS-P-003**: Add multiple image support per listing
- [ ] **SS-P-004**: Implement user ratings/reviews

---

# PHASE 6: Testing & Documentation (Week 8-9)

## All Apps

- [ ] **TEST-001**: Set up Jest/Vitest testing framework
- [ ] **TEST-002**: Write unit tests for custom hooks
- [ ] **TEST-003**: Write unit tests for API routes
- [ ] **TEST-004**: Set up Playwright for E2E testing
- [ ] **TEST-005**: Write E2E tests for auth flows
- [ ] **TEST-006**: Write E2E tests for main user journeys
- [ ] **TEST-007**: Add visual regression testing
- [ ] **DOC-001**: Create API documentation
- [ ] **DOC-002**: Update README files with setup instructions
- [ ] **DOC-003**: Document deployment procedures

---

# PHASE 7: Production Deployment (Week 9-10)

## Pre-Deployment Checklist

- [ ] **DEPLOY-001**: Set up error monitoring (Sentry)
- [ ] **DEPLOY-002**: Configure analytics (Plausible/PostHog)
- [ ] **DEPLOY-003**: Set up database backups in Supabase
- [ ] **DEPLOY-004**: Configure CDN for images
- [ ] **DEPLOY-005**: Set up custom domains
- [ ] **DEPLOY-006**: Configure SSL certificates
- [ ] **DEPLOY-007**: Set up CI/CD pipelines
- [ ] **DEPLOY-008**: Create staging environment
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
