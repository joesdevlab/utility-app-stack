# Database Backup Procedures

This document outlines the database backup strategy for the HoldCo Utility App Stack using Supabase.

## Supabase Built-in Backups

### Automatic Daily Backups (Pro Plan)

Supabase Pro plan includes:
- **Daily automated backups** retained for 7 days
- **Point-in-time recovery (PITR)** with 7-day retention
- Backups stored in a separate region for disaster recovery

### Enabling PITR

1. Go to Supabase Dashboard
2. Navigate to **Settings > Database**
3. Enable **Point-in-time Recovery**
4. Select retention period (7 days default on Pro)

## Manual Backup Procedures

### Using pg_dump

For manual backups, use PostgreSQL's pg_dump utility:

```bash
# Get connection string from Supabase Dashboard > Settings > Database
# Connection string format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Full database backup
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Backup specific tables only
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --format=custom \
  --no-owner \
  --no-privileges \
  -t apprentice_entries \
  -t medicines \
  -t salvage_listings \
  -f tables_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref [PROJECT_REF]

# Dump schema and data
supabase db dump --data-only -f data_backup.sql
supabase db dump --schema-only -f schema_backup.sql
```

## Restore Procedures

### Restore from pg_dump

```bash
# Restore full backup
pg_restore -d "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-privileges \
  backup_file.dump

# Restore specific tables
pg_restore -d "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-privileges \
  --table=apprentice_entries \
  backup_file.dump
```

### Point-in-time Recovery

1. Go to Supabase Dashboard
2. Navigate to **Database > Backups**
3. Click **Restore**
4. Select the desired recovery point
5. Confirm restoration

**Note**: PITR restoration creates a new database branch. Plan for downtime.

## Backup Schedule

| Type | Frequency | Retention | Method |
|------|-----------|-----------|--------|
| Automatic | Daily | 7 days | Supabase (Pro) |
| PITR | Continuous | 7 days | Supabase (Pro) |
| Manual | Weekly | 30 days | pg_dump to cloud storage |
| Pre-deployment | Before each release | 7 days | pg_dump |

## Storage Locations

### Recommended Cloud Storage

Store manual backups in cloud storage:

```bash
# AWS S3
aws s3 cp backup_file.dump s3://holdco-backups/utility-apps/

# Google Cloud Storage
gsutil cp backup_file.dump gs://holdco-backups/utility-apps/

# Azure Blob Storage
az storage blob upload -f backup_file.dump -c holdco-backups -n utility-apps/backup_file.dump
```

## Automated Backup Script

Create a scheduled backup script:

```bash
#!/bin/bash
# backup-databases.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/supabase"
S3_BUCKET="s3://holdco-backups/utility-apps"

# Database connection (use environment variable)
DB_URL="${SUPABASE_DB_URL}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump database
echo "Creating backup..."
pg_dump "$DB_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  -f "$BACKUP_DIR/backup_$DATE.dump"

# Compress
gzip "$BACKUP_DIR/backup_$DATE.dump"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "$BACKUP_DIR/backup_$DATE.dump.gz" "$S3_BUCKET/backup_$DATE.dump.gz"

# Cleanup old local backups (keep last 7)
ls -t "$BACKUP_DIR"/*.dump.gz 2>/dev/null | tail -n +8 | xargs -r rm

echo "Backup completed: backup_$DATE.dump.gz"
```

### Cron Schedule

```bash
# Run weekly on Sunday at 2 AM
0 2 * * 0 /path/to/backup-databases.sh >> /var/log/db-backup.log 2>&1
```

## Supabase Storage Backups

For Supabase Storage (images), use the Supabase API:

```bash
# List all files in a bucket
curl -X GET "https://[PROJECT_REF].supabase.co/storage/v1/bucket/listing-images" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"

# Download files using the API
# For large buckets, consider using rclone with S3-compatible API
```

## Monitoring & Alerts

### Backup Monitoring

1. **Supabase Dashboard**: Check backup status in Settings > Database
2. **Email Alerts**: Configure in Supabase for backup failures
3. **Uptime Monitoring**: Use a service like Better Uptime or Pingdom

### Backup Verification

Weekly verification checklist:

- [ ] Verify automatic backup completed
- [ ] Check backup file sizes are reasonable
- [ ] Test restore to staging environment monthly
- [ ] Review backup retention periods

## Disaster Recovery

### RTO/RPO Targets

| Metric | Target |
|--------|--------|
| Recovery Point Objective (RPO) | 1 hour |
| Recovery Time Objective (RTO) | 4 hours |

### Recovery Steps

1. **Assess the situation** - Determine data loss scope
2. **Notify stakeholders** - Alert team of incident
3. **Choose recovery point** - Select appropriate backup
4. **Execute restoration** - Restore from backup
5. **Verify data integrity** - Test restored data
6. **Resume operations** - Bring systems back online
7. **Post-mortem** - Document and prevent recurrence

## Data Retention Policy

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| User accounts | Indefinite | Until deletion request |
| Apprentice entries | 7 years | BCITO requirements |
| Medicine scans | 1 year | Personal data cleanup |
| Salvage listings | 90 days after claimed | Cleanup script |
| Backups | 30 days | Rolling retention |

## Compliance Notes

- **Privacy Act 2020 (NZ)**: Users can request data export/deletion
- **BCITO Requirements**: Apprentice logs may need 7-year retention
- **GDPR** (if applicable): Right to erasure compliance

## Contact

For backup emergencies:
- Supabase Support: support@supabase.io
- Database Admin: [Your DBA Contact]
