# Staging Environment Setup

This document describes how to set up and use staging environments for the HoldCo Utility App Stack.

## Overview

The staging environment mirrors production but uses separate:
- Supabase project (isolated database and storage)
- Environment variables
- Vercel preview deployments

## Supabase Staging Project

### Creating a Staging Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project named `holdco-utility-staging`
3. Note the project URL and anon key

### Database Setup

Run all migrations against the staging database:

```bash
# Link to staging project
supabase link --project-ref [STAGING_PROJECT_REF]

# Push migrations
supabase db push

# Seed test data (optional)
psql $STAGING_DATABASE_URL -f supabase/seed/staging-data.sql
```

### Storage Buckets

Create the same storage buckets as production:

```sql
-- listing-images bucket for Salvage Scout
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);
```

## Environment Variables

### GitHub Secrets for Staging

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `STAGING_SUPABASE_URL` | Staging Supabase project URL |
| `STAGING_SUPABASE_ANON_KEY` | Staging Supabase anon key |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_APPRENTICE_LOG_PROJECT_ID` | Vercel project ID |
| `VERCEL_BIO_SWAP_PROJECT_ID` | Vercel project ID |
| `VERCEL_SALVAGE_SCOUT_PROJECT_ID` | Vercel project ID |

### Local Staging Testing

Create `.env.staging` files in each app:

```env
# apprentice-log/.env.staging
NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_anon_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_SENTRY_DSN=your_staging_sentry_dsn
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=staging.apprentice-log.holdco.nz
```

Run with staging config:

```bash
# Copy staging env
cp .env.staging .env.local

# Run development server
npm run dev
```

## Deployment Workflow

### Automatic Staging Deployments

Pushing to the `develop` branch triggers automatic staging deployments:

```
develop branch → GitHub Actions → Vercel Preview
```

### Manual Staging Deployment

Use the workflow dispatch to manually deploy:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Staging**
3. Click **Run workflow**
4. Select the `develop` branch

### Staging URLs

After deployment, staging URLs follow the pattern:
- `https://apprentice-log-[hash].vercel.app`
- `https://bio-swap-[hash].vercel.app`
- `https://salvage-scout-[hash].vercel.app`

## Testing in Staging

### Test Accounts

Create test accounts in the staging Supabase project:

| Email | Password | Purpose |
|-------|----------|---------|
| test@example.com | TestPass123! | General testing |
| admin@example.com | AdminPass123! | Admin features |
| qa@example.com | QATestPass123! | QA testing |

### Test Data

The staging database should include:
- Sample apprentice entries
- Test medicine data
- Demo salvage listings

```sql
-- Example: Insert test apprentice entry
INSERT INTO apprentice_entries (user_id, date, tasks, total_hours)
VALUES (
  '[TEST_USER_ID]',
  CURRENT_DATE,
  '[{"description": "Test task", "hours": 4, "tools": ["hammer"], "skills": ["framing"]}]',
  4
);
```

## Monitoring Staging

### Sentry (Staging Environment)

Sentry should be configured with a staging environment tag:
- Filter by `environment: staging` in Sentry dashboard
- Separate error tracking from production

### Logs

View staging logs in Vercel:
1. Go to Vercel Dashboard
2. Select the project
3. Navigate to **Deployments**
4. Click on the staging deployment
5. View **Functions** logs

## Branch Strategy

```
main (production)
  ↑
  └── develop (staging)
        ↑
        └── feature/* (local development)
```

### Workflow

1. Create feature branch from `develop`
2. Develop and test locally
3. Open PR to `develop`
4. CI runs tests
5. Merge to `develop` → Auto-deploy to staging
6. QA tests on staging
7. Open PR from `develop` to `main`
8. Merge to `main` → Auto-deploy to production

## Cleanup

### Database Cleanup

Run periodic cleanup in staging:

```sql
-- Delete old test entries (older than 30 days)
DELETE FROM apprentice_entries
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM bioswap_scans
WHERE created_at < NOW() - INTERVAL '30 days';

DELETE FROM salvage_listings
WHERE created_at < NOW() - INTERVAL '30 days';
```

### Storage Cleanup

Clean up old test images:

```bash
# Using Supabase CLI
supabase storage rm --recursive listing-images/test-*
```

## Troubleshooting

### Deployment Failures

1. Check GitHub Actions logs
2. Verify all secrets are set
3. Check Vercel build logs

### Database Issues

1. Verify migrations are up to date
2. Check RLS policies
3. Verify connection credentials

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables |
| Auth not working | Verify Supabase URL and keys |
| Images not loading | Check storage bucket policies |
| API 500 errors | Check function logs in Vercel |
