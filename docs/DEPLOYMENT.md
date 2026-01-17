# HoldCo Utility App Stack - Deployment Guide

This guide covers deploying all three PWAs (Apprentice-Log, Bio-Swap, Salvage-Scout) to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- **Vercel** - Hosting platform (recommended)
- **Supabase** - Database and authentication
- **OpenAI** - API access (for Apprentice-Log and Salvage-Scout)

### Required Tools
- Node.js 18+
- npm or pnpm
- Git
- Vercel CLI (`npm i -g vercel`)
- Supabase CLI (`npm i -g supabase`)

---

## Environment Setup

### Production Environment Variables

Each app requires specific environment variables in production:

#### Apprentice-Log
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=sk-your_production_key
```

#### Bio-Swap
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### Salvage-Scout
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=sk-your_production_key
```

### Security Considerations

1. **Never commit API keys** - Use environment variables
2. **Use separate Supabase projects** for staging and production
3. **Rotate API keys** immediately if exposed
4. **Enable Supabase RLS** - All tables should have Row Level Security enabled

---

## Supabase Configuration

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project for production
3. Note the project URL and anon key

### 2. Run Database Migrations

From the project root:

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Seed Initial Data (Bio-Swap only)

```bash
# Run the medicine data seed script
psql $DATABASE_URL -f supabase/seed/medicines.sql
```

### 4. Configure Storage Buckets

For Salvage-Scout, create the listing images bucket:

```sql
-- In Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true);

-- Set up storage policies
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
```

### 5. Enable Row Level Security

Verify RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 2. Deploy Each App

#### Apprentice-Log

```bash
cd apprentice-log
vercel --prod
```

When prompted:
- Link to existing project? **No** (first time)
- Project name: `apprentice-log`
- Framework: `Next.js`
- Root directory: `.`

#### Bio-Swap

```bash
cd bio-swap
vercel --prod
```

#### Salvage-Scout

```bash
cd salvage-scout
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard for each project:

1. Go to **Settings > Environment Variables**
2. Add all required variables
3. Select **Production** environment
4. Redeploy to apply changes

### 4. Configure Build Settings

Each app should have these build settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## Domain Configuration

### 1. Add Custom Domains in Vercel

1. Go to project **Settings > Domains**
2. Add your domain (e.g., `apprentice-log.holdco.nz`)
3. Follow DNS configuration instructions

### 2. DNS Records

Add these records at your DNS provider:

```
Type: CNAME
Name: apprentice-log
Value: cname.vercel-dns.com

Type: CNAME
Name: bio-swap
Value: cname.vercel-dns.com

Type: CNAME
Name: salvage-scout
Value: cname.vercel-dns.com
```

### 3. SSL Certificates

Vercel automatically provisions SSL certificates. Verify:
- HTTPS is working
- HTTP redirects to HTTPS
- Certificate is valid

---

## Post-Deployment Checklist

### Functional Testing

- [ ] User registration works
- [ ] User login works
- [ ] Password reset flow works
- [ ] Core app features function correctly
- [ ] API endpoints return expected responses
- [ ] Images upload and display correctly
- [ ] PWA install prompt appears
- [ ] Offline mode works as expected

### Security Verification

- [ ] All API routes require authentication
- [ ] Rate limiting is active
- [ ] RLS policies are enforced
- [ ] No sensitive data in browser console
- [ ] HTTPS enforced everywhere

### Performance Checks

- [ ] Lighthouse score > 80 for all metrics
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Core Web Vitals passing

### Accessibility

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

---

## Monitoring & Maintenance

### Error Monitoring (Recommended: Sentry)

1. Create Sentry project for each app
2. Install Sentry SDK:

```bash
npm install @sentry/nextjs
```

3. Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: "your-org",
  project: "apprentice-log",
});
```

### Analytics (Recommended: Plausible)

Add to each app's layout:

```html
<script defer data-domain="apprentice-log.holdco.nz" src="https://plausible.io/js/script.js"></script>
```

### Database Backups

Enable in Supabase Dashboard:
1. Go to **Settings > Database**
2. Enable **Point-in-time Recovery** (Pro plan)
3. Configure backup retention

### Scheduled Maintenance

**Daily:**
- Monitor error rates in Sentry
- Check API response times

**Weekly:**
- Review analytics for usage patterns
- Check Supabase database usage

**Monthly:**
- Update dependencies
- Review and rotate API keys
- Check SSL certificate expiry
- Review access logs for anomalies

---

## Rollback Procedures

### Vercel Rollback

1. Go to project **Deployments**
2. Find the last working deployment
3. Click **...** > **Promote to Production**

### Database Rollback

```bash
# List migrations
supabase migration list

# Rollback last migration
supabase db reset --version <previous_version>
```

---

## Troubleshooting

### Build Failures

1. Check build logs in Vercel
2. Verify all environment variables are set
3. Run `npm run build` locally to reproduce

### API Errors

1. Check Vercel function logs
2. Verify Supabase connection
3. Check OpenAI API status and quotas

### Database Issues

1. Check Supabase Dashboard for errors
2. Verify RLS policies
3. Check connection pooling limits

### PWA Issues

1. Clear service worker cache
2. Check manifest.json is accessible
3. Verify icons are loading

---

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Supabase Support**: support@supabase.io
- **OpenAI Support**: support@openai.com

---

## Appendix: Complete Deployment Script

```bash
#!/bin/bash
# deploy-all.sh - Deploy all apps to production

set -e

echo "Deploying Apprentice-Log..."
cd apprentice-log
vercel --prod --yes
cd ..

echo "Deploying Bio-Swap..."
cd bio-swap
vercel --prod --yes
cd ..

echo "Deploying Salvage-Scout..."
cd salvage-scout
vercel --prod --yes
cd ..

echo "All apps deployed successfully!"
```

Make executable:
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```
